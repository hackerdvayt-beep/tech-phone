import axios from "axios";

export const createInstallmentRequest =
  (requestData) => async (dispatch, getState) => {
    const {
      userLogin: { userInfo },
    } = getState();

    if (!userInfo?.token) {
      throw new Error("Vui lòng đăng nhập để gửi yêu cầu trả góp");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      "/api/installment-requests",
      requestData,
      config
    );
    return data;
  };
