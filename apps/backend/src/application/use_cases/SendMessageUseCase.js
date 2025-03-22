import BullQueue from "../../infrastructure/queue/BullQueue.js";

export default {
  async execute(data) {
    const { phone, message } = data;
    try {
      await BullQueue.addToQueue({ phone, message });

      return {
        statusCode: 202,
      };
    } catch (error) {
      return {
        statusCode: 500,
        data: { error: "Failed to enqueue message" },
      };
    }
  },
};
