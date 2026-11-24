import dotenv from "dotenv";
import "colors";
import mongoose from "mongoose";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";
import products from "./data/products.js";
import connectDB from "./config/db.js";

dotenv.config();

const syncProductCatalog = async () => {
  try {
    await connectDB();
    const admin = await User.findOne({ isAdmin: true }).select("_id");
    if (!admin) {
      throw new Error("Cannot sync catalog: no admin user exists");
    }

    let updated = 0;
    let inserted = 0;
    for (const productData of products) {
      const existing = await Product.findOne({ name: productData.name });
      const product = existing || new Product({ user: admin._id });
      Object.assign(product, productData);
      if (!existing) product.user = admin._id;
      await product.save();
      if (existing) updated += 1;
      else inserted += 1;
    }

    console.log(`Catalog sync complete: ${inserted} inserted, ${updated} updated. Existing products were not deleted.`);
  } catch (error) {
    console.error(`Catalog sync failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

syncProductCatalog();
