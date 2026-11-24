import asyncHandler from "express-async-handler";

const getBankTransferConfig = asyncHandler(async (req, res) => {
  const bankCode = String(process.env.BANK_QR_BANK_CODE || "").trim();
  const accountNumber = String(process.env.BANK_QR_ACCOUNT || "").trim();
  const accountName = String(process.env.BANK_QR_ACCOUNT_NAME || "").trim();
  const configured = Boolean(
    bankCode &&
      accountNumber &&
      accountName &&
      !/YOUR_/i.test(`${bankCode} ${accountNumber} ${accountName}`)
  );

  res.json({
    configured,
    ...(configured ? { bankCode, accountNumber, accountName } : {}),
  });
});

export { getBankTransferConfig };
