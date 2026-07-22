// Real email templates from Matt (The Spa Haus). Each function returns the
// exact ready-to-send text with customer/spa data interpolated — Matt copies
// this into Gmail and sends by hand until real send integration exists.

type TemplateContact = {
  firstName: string;
  lastName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
};

type TemplateQuote = {
  productModel: string | null;
  dimensions: string | null;
};

const SIGNOFF = "The Spa Haus\n(919) 946-3154 | matt@thespahausnc.com";

export function orderedTemplate(contact: TemplateContact) {
  return {
    subject: "Your Spa Haus Order Is In Production!",
    body: `Hi ${contact.firstName},

Exciting news — your spa has been officially ordered and is now in production.

We'll be keeping a close eye on things and will reach out as soon as we have a shipping update and estimated arrival date for you. In the meantime, please don't hesitate to reach out if you have any questions at all.

We're thrilled to be a part of this for you and can't wait to get your spa to your house!

${SIGNOFF}`,
  };
}

export function shippedTemplate(contact: TemplateContact) {
  return {
    subject: "Your Spa Has Shipped!",
    body: `Hi ${contact.firstName},

Great news — your spa has shipped from Arizona and is heading our way. Shipping typically takes a full week with it coming from Arizona. We'll know more when we receive a call from the logistics carrier.

We'll send you another update the moment it arrives so we can get the delivery process started. As always, feel free to reach out if you have any questions in the meantime.

We appreciate your patience — it's almost time!

${SIGNOFF}`,
  };
}

export function receivedAtShopTemplate(
  contact: TemplateContact,
  deliveryMethod: "SPA_HAUS_TEAM" | "HOT_TUB_TAXI" | null,
) {
  const coordinatorLine =
    deliveryMethod === "HOT_TUB_TAXI"
      ? "You can expect to hear from our delivery coordinator, Hot Tub Taxi, to set up a delivery time that works for you."
      : deliveryMethod === "SPA_HAUS_TEAM"
        ? "Our delivery team will be reaching out to set up a delivery time that works for you."
        : "We'll be reaching out shortly to set up a delivery time that works for you.";

  return {
    subject: "Your Spa Has Arrived at Our Shop!",
    body: `Hi ${contact.firstName},

Your spa has arrived at our shop and everything looks great! We're coordinating with our delivery team now to get it scheduled and to your home as soon as possible.

${coordinatorLine} If you have any questions or a preferred delivery window, please don't hesitate to let us know and we'll do our best to accommodate.

We're almost there — thank you for your patience throughout this process!

${SIGNOFF}`,
  };
}

export function notifyDariusTemplate(
  contact: TemplateContact,
  quote: TemplateQuote,
) {
  return {
    subject: `Spa Ready for Delivery — ${contact.firstName} ${contact.lastName}`,
    body: `Hi Darius,

We have a spa ready for delivery. Please see the customer details below and reach out to them directly to coordinate a delivery date.

Customer: ${contact.firstName} ${contact.lastName}
Address: ${contact.address ?? "[fill in]"}
Phone: ${contact.phone ?? "[fill in]"}
Email: ${contact.email ?? "[fill in]"}

Spa model: ${quote.productModel ?? "[fill in]"}
Dimensions: ${quote.dimensions ?? "[fill in]"}
Additional notes:

Please make contact with the customer at your earliest convenience to get this scheduled. Let us know if you have any questions.

Thank you, Darius!

${SIGNOFF}`,
  };
}

// Internal task text (not a customer email) for deliveries the Spa Haus
// team handles themselves instead of handing off to Hot Tub Taxi.
export function inHouseDeliveryTaskText(
  contact: TemplateContact,
  quote: TemplateQuote,
) {
  return `Coordinate an in-house delivery with the Spa Haus team (Matt, Mark, Dan) and schedule a date with the customer.

Customer: ${contact.firstName} ${contact.lastName}
Address: ${contact.address ?? "[fill in]"}
Phone: ${contact.phone ?? "[fill in]"}
Email: ${contact.email ?? "[fill in]"}

Model: ${quote.productModel ?? "[fill in]"}
Dimensions: ${quote.dimensions ?? "[fill in]"}

- Confirm crew availability (Matt, Mark, Dan)
- Schedule delivery date/time with the customer
- Review site access notes before heading out`;
}

// Internal task text for hot tubs where Matt hasn't decided yet who delivers.
export function decideDeliveryMethodTaskText(contact: TemplateContact) {
  return `Decide who delivers for ${contact.firstName} ${contact.lastName}: Spa Haus team (Matt, Mark, Dan) or Hot Tub Taxi (Darius).

Consider terrain, distance, difficulty, and technicality of the site.

Set the delivery method on the installation page — then either coordinate the in-house delivery or email Darius to hand it off.

Customer address: ${contact.address ?? "[fill in]"}`;
}

export function deliveredTemplate(contact: TemplateContact) {
  return {
    subject: "Congratulations — Your Spa Has Been Delivered!",
    body: `Hi ${contact.firstName},

Congratulations — your spa has been delivered and we couldn't be more excited for you! On behalf of everyone at The Spa Haus, welcome to the family.

Before you dive in, here's what to expect next. We will be coordinating a date and time with you and our After Sales Manager, Dan, to come out and install your cover lifter, steps, cover clips, and any other accessories you have included in your purchase. Ideally, Dan conducts his visit AFTER you have had your electrician wire your spa and the spa is full of water.

In the meantime, if you have any questions or need anything at all, please don't hesitate to call or email us. We're always happy to help.

Thank you so much for choosing The Spa Haus. We truly appreciate your business and look forward to being your spa resource for years to come. Enjoy every soak!

${SIGNOFF}`,
  };
}

export function completeTemplate(contact: TemplateContact) {
  return {
    subject: "Welcome to Spa Ownership — Your Permanent Reference",
    body: `Hi ${contact.firstName},

Congratulations — you are officially a spa owner, and we could not be more excited for you. Thank you for trusting The Spa Haus with your purchase. Please save this email. It is your permanent post-installation reference.


YOUR NEW OWNER GUIDE

Everything you need to know about your spa — from water care to warranty — is covered in the New Owner Guide we sent you at the time of purchase. Keep it saved and refer back to it often. If you ever need another copy, just reach out and we will send it right over.


HEAT-UP EXPECTATIONS

On a 220V spa, expect roughly 1°F of temperature increase every 15 minutes. Heat-up time varies based on your starting water temperature and outdoor conditions. Keep the cover fully closed during heat-up to retain heat as efficiently as possible.


HELPFUL VIDEO RESOURCES

These Swim University playlists are excellent visual references for new spa owners:

Hot Tub Basics & Ownership (33 videos)
https://youtube.com/playlist?list=PLE3A3378B429AB7D2

Water Chemistry & Maintenance (19 videos)
https://youtube.com/playlist?list=PLENw7_t7gbd67Ya9QZRDuWUg_ldng0zDb


WARRANTY

The Spa Haus has already submitted your manufacturer warranty registration on your behalf — you do not need to do anything. If you ever want to review your Vita Spa warranty terms or download your warranty document by series, you can find them here:
https://vitaspa.com/policy/warranty

For any potential warranty concern, always contact The Spa Haus first. Do not contact the manufacturer directly — we manage that process for you.


OWNER'S MANUALS

Vita Spa
https://vitaspa.com/services/manuals-archive

American Whirlpool
https://americanwhirlpool.com/owners-manual-archive/


A FEW REMINDERS

- Always test your water before adding any chemicals
- More use = more chemicals. Less use = fewer chemicals.
- Rinse your filters weekly with a garden hose
- Remove the cover fully when adding chemicals
- Drain and refill approximately every 3 months based on usage
- For error codes, warranty concerns, or anything else — contact The Spa Haus first


WE ARE HERE FOR YOU

If you have questions that are not answered by your New Owner Guide or the resources above, do not hesitate to reach out. We want you relaxing in your spa — not troubleshooting it.

Enjoy every soak. You have earned it!

${SIGNOFF}`,
  };
}

export function prepCheckInTemplate(contact: TemplateContact) {
  return {
    subject: "Quick Check-In on Site & Electrical Prep",
    body: `Hi ${contact.firstName},

Just checking in while your spa is in production — do you have a concrete/decking contractor and an electrician lined up yet, along with a rough date for that work?

No rush if not, just want to make sure we're tracking toward a smooth delivery and install once your spa arrives. Let us know either way!

${SIGNOFF}`,
  };
}

export function renderForTask(template: { subject: string; body: string }) {
  return `Subject: ${template.subject}\n\n${template.body}`;
}
