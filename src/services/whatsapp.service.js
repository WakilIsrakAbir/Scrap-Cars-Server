/**
 * WhatsApp Cloud API Service & Helper Utilities
 * Supports Meta Cloud API directly and provides fallback wa.me URL generation
 */

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

/**
 * Clean phone number to international UAE/global format (e.g. 971501234567)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  // If UAE number starts with 05, replace 0 with 971
  if (cleaned.startsWith("05") && cleaned.length === 10) {
    cleaned = "971" + cleaned.substring(1);
  }
  return cleaned;
};

/**
 * Generate direct WhatsApp Click-to-Chat link
 */
const generateWhatsAppLink = (phone, text) => {
  const formattedPhone = formatPhoneNumber(phone || process.env.ADMIN_WHATSAPP_NUMBER || "971501234567");
  const encodedText = encodeURIComponent(text || "");
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
};

/**
 * Send WhatsApp text message via Meta Cloud API
 */
const sendWhatsAppMessage = async (toPhone, messageText) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const formattedTo = formatPhoneNumber(toPhone);

  if (!token || !phoneNumberId || !formattedTo) {
    console.log(`[WhatsApp Service] Meta Cloud API credentials or phone not provided. Falling back to wa.me link.`);
    return {
      success: false,
      isSimulated: true,
      chatUrl: generateWhatsAppLink(formattedTo, messageText),
    };
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedTo,
        type: "text",
        text: { body: messageText },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("[WhatsApp Service Error]", data);
      return { success: false, error: data, chatUrl: generateWhatsAppLink(formattedTo, messageText) };
    }

    console.log("[WhatsApp Service] Message sent successfully to", formattedTo);
    return { success: true, data, chatUrl: generateWhatsAppLink(formattedTo, messageText) };
  } catch (error) {
    console.error("[WhatsApp Service Network Error]", error.message);
    return { success: false, error: error.message, chatUrl: generateWhatsAppLink(formattedTo, messageText) };
  }
};

/**
 * Notify Admin when a new car scrap request is submitted
 */
const notifyAdminNewCarPost = async (post, user) => {
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || "971501234567";
  const message = `🚗 *New Scrap Car Submission*\n\n` +
    `• *Car:* ${post.year} ${post.brand} ${post.model}\n` +
    `• *Condition:* ${post.condition}\n` +
    `• *Location:* ${post.locationAddress}\n` +
    `• *Customer:* ${user?.name || "Customer"} (${user?.phone || "N/A"})\n` +
    `• *Post ID:* ${post._id}\n\n` +
    `Please review the post in the Admin Panel to send a cash offer!`;

  return await sendWhatsAppMessage(adminPhone, message);
};

/**
 * Notify User when Admin sends a cash offer
 */
const notifyUserOfferReceived = async (user, post, offerPrice) => {
  if (!user || !user.phone) return null;

  const message = `🎉 *Great News from ScrapCars Dubai!*\n\n` +
    `Hi ${user.name},\n` +
    `We have reviewed your *${post.year} ${post.brand} ${post.model}* and prepared a cash offer for you:\n\n` +
    `💰 *Guaranteed Cash Offer: AED ${Number(offerPrice).toLocaleString()}*\n\n` +
    `• Free Towing & Pickup across UAE\n` +
    `• Instant Cash Payment on spot\n` +
    `• Free RTA Paperwork Transfer\n\n` +
    `Please log in to your dashboard to Accept or Reject this offer.`;

  return await sendWhatsAppMessage(user.phone, message);
};

/**
 * Notify User when post status changes
 */
const notifyStatusChange = async (user, post, status) => {
  if (!user || !user.phone) return null;

  const statusMessages = {
    UNDER_REVIEW: `🔍 Your car submission for ${post.brand} ${post.model} is now *under review* by our valuation team.`,
    ACCEPTED: `✅ You have accepted the cash offer for ${post.brand} ${post.model}! Our team will contact you shortly to schedule free pickup.`,
    PICKUP_SCHEDULED: `🚛 *Pickup Scheduled!* Our driver will arrive at ${post.locationAddress} to inspect, tow, and pay cash for your car.`,
    COMPLETED: `🎉 *Deal Completed!* Thank you for choosing ScrapCars Dubai. Your vehicle transaction has been finalized.`,
    CANCELLED: `❌ Your car request for ${post.brand} ${post.model} has been marked as cancelled.`,
  };

  const text = statusMessages[status];
  if (!text) return null;

  const message = `📋 *ScrapCars Dubai Update*\n\n` +
    `Hi ${user.name},\n` +
    `${text}\n\n` +
    `For any questions, reply directly to this message.`;

  return await sendWhatsAppMessage(user.phone, message);
};

module.exports = {
  formatPhoneNumber,
  generateWhatsAppLink,
  sendWhatsAppMessage,
  notifyAdminNewCarPost,
  notifyUserOfferReceived,
  notifyStatusChange,
};
