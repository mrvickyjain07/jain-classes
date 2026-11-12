/** WhatsApp Click-to-Chat helpers. The visitor always sends the message themselves. */

export const DEFAULT_WHATSAPP_NUMBER = "917558536630";

export function normaliseWhatsAppNumber(value: string | undefined): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return DEFAULT_WHATSAPP_NUMBER;
}

export function whatsappUrl(number: string | undefined, message: string): string {
  return `https://wa.me/${normaliseWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;
}

export type EnquiryContext =
  | { type: "general" }
  | { type: "course"; course: string }
  | { type: "materials"; topic?: string }
  | { type: "guidance" }
  | { type: "professor" };

export function contextualMessage(context: EnquiryContext, institute = "Jain Classes"): string {
  const greeting = `Hello ${institute},`;
  const closing = "Please share further details.\n\nThank you.";
  switch (context.type) {
    case "course":
      return `${greeting}\n\nI am interested in the ${context.course} course.\n\n${closing}`;
    case "materials":
      return `${greeting}\n\nI have a question about the free study materials${
        context.topic ? ` for ${context.topic}` : ""
      }.\n\n${closing}`;
    case "guidance":
      return `${greeting}\n\nI need guidance for my competitive examination preparation.\n\n${closing}`;
    case "professor":
      return `${greeting}\n\nI would like to connect with the professor for guidance on my preparation.\n\n${closing}`;
    default:
      return `${greeting}\n\nI am interested in your educational courses.\n\n${closing}`;
  }
}

export type EnquiryInput = {
  name: string;
  mobile: string;
  exam: string;
  course: string;
  message: string;
};

export function enquiryMessage(input: EnquiryInput, institute = "Jain Classes"): string {
  return [
    `Hello ${institute},`,
    "",
    "I am interested in your educational courses.",
    "",
    `Student Name: ${input.name}`,
    `Mobile Number: ${input.mobile}`,
    `Interested Examination: ${input.exam}`,
    `Course: ${input.course || "Not decided yet"}`,
    `Message: ${input.message || "-"}`,
    "",
    "Please share further details.",
    "",
    "Thank you.",
  ].join("\n");
}
