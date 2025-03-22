import WhatsAppService from "../../infrastructure/services/WhatsAppService.js";

export default {
  async execute() {
    try {
      const qrCode = await WhatsAppService.getQRCode();
      return {
        statusCode: 200,
        data: { qrCode },
      };
    } catch (error) {
      return {
        statusCode: 500,
        data: { error: { message: "Failed to retrieve QR code" } },
      };
    }
  },
};
