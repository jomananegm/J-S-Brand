/* =====================================================================
   J'S — OWNER SETTINGS
   Edit this file only. Anything left as null shows a safe
   "confirmed on WhatsApp" message instead of a made-up value.
   ===================================================================== */
window.JS_CONFIG = {
  brand: {
    name: "J'S",
    descriptor: "THE LITTLE TREAT BRAND",
    tagline: "A LITTLE SOMETHING GOOD.",
    campaign: "LITTLE TREATS. BIG MOODS."
  },
  contact: { whatsappIntl: "201284184425", whatsappDisplay: "01284184425" },
  payment: { method: "InstaPay", instapayAlias: "01284184425" },
  social: {
    instagramHandle: "j's",
    instagramUrl: null          // e.g. "https://www.instagram.com/<exact-handle>/" — only once confirmed
  },
  delivery: {
    city: "Alexandria",
    cityAr: "إسكندرية",
    fee: null,                  // fee for items that DON'T include delivery. The Big Mood Box already includes it.
    areas: [],                  // e.g. ["Smouha", "Sporting"] → turns the area field into a dropdown
    eta: null,                  // بالعامية، مثلاً: "بيوصل في نفس اليوم للطلبات قبل 5 العصر" — بس لو أكيد
    pickup: null                // مثلاً: "ينفع تستلم من ..." — null = مش متاح على الموقع
  },
  launch: {                     // The First Drop — leave null unless real
    deadline: null,             // ISO date, e.g. "2026-12-05T20:00:00+02:00" → shows a countdown
    limitedQuantity: null       // number of boxes in the drop, e.g. 40 → "Only 40 boxes in this drop"
  },
  founder: { name: "Jana Negm", nameAr: "جنى نجم", photo: "assets/photos/founder-jana-negm.webp", bio: null },
  community: { name: "Little Treats with J'S" },   // اسم الكوميونتي اللي بنعمل فيها منشن للزباين   // photo: "assets/images/founder-jana.jpg"; bio: Jana's own words
  /* Product media. Photos in assets/photos/ are J'S brand shots; box images are 3D renders
     until real box photos exist — set the path to replace any of them. */
  photos: {
    hero: "assets/photos/roll-hero.webp",
    rollWide: "assets/photos/roll-wide.webp",
    rollPlate: "assets/photos/roll-plate.webp",
    boxOpen: null,              // e.g. "assets/photos/box-open.webp" — replaces the 3D render
    boxTop: null,
    boxClosed: null,
    shared: null
  },
  occasions: [
    { id: "study", label: "Study night", ar: "ليلة مذاكرة", line: "المذاكرة عايزة سكر… والسكر عايز رول." },
    { id: "girls", label: "Girls' night", ar: "قعدة البنات", line: "القعدة مش هتكمل من غير بوكس." },
    { id: "birthday", label: "Birthday surprise", ar: "مفاجأة عيد ميلاد", line: "مفاجأة على السريع… ومحدش هيتوقعها." },
    { id: "office", label: "Office treat", ar: "تريت للشغل", line: "هات بوكس للمكتب… وهتبقى نجم اليوم." },
    { id: "justbecause", label: "Just because", ar: "من غير سبب", line: "من غير سبب… وده أحلى سبب." }
  ],
  order: { maxQtyPerItem: 10 },
  showSetupNotice: false         // set to false when the details above are filled in
};

/* Products. Add more objects later — the cart, menu and checkout pick them up automatically. */
window.JS_PRODUCTS = [
  {
    id: "big-mood-box",
    slug: "big-mood-box",
    name: "The Big Mood Box",
    nameAr: "البوكس الكبير",
    subtitle: "12 Classic Cinnamon Rolls",
    subtitleAr: "12 رول سينامون كلاسيك",
    description: "Twelve Classic Cinnamon Rolls in one J'S box. Made for sharing, splitting with the group chat — or not sharing at all.",
    descriptionAr: "12 رول كلاسيك في بوكس واحد. للشلة، للبيت، أو ليك لوحدك… مش هنحكم.",
    pieces: 12,
    unitLabel: "box",
    price: 450,                 // EGP
    deliveryIncluded: true,     // 450 EGP is the full price, delivery in Alexandria included
    image: "assets/images/box-open-angle.webp",
    imageAlt: "The Big Mood Box open, with 12 Classic Cinnamon Rolls inside",
    category: "boxes",
    availability: "available",  // "available" | "sold-out" | "coming-soon"
    featured: true,
    details: { inside: "12 رول سينامون كلاسيك", ingredients: null, allergens: null, size: null }
  },
  {
    id: "classic-roll",
    slug: "classic-cinnamon-roll",
    name: "Classic Cinnamon Roll",
    nameAr: "الرول الكلاسيك",
    subtitle: "Single roll",
    subtitleAr: "رول واحدة",
    description: "The roll inside every Big Mood Box: a soft cinnamon swirl finished with icing.",
    descriptionAr: "الرول اللي جوه كل بوكس: سينامون طري ومتغطي أيسينج.",
    pieces: 1,
    unitLabel: "roll",
    price: null,                // set a price and change availability to "available" to sell singles
    deliveryIncluded: false,
    image: "assets/photos/roll-wide.webp",
    imageAlt: "Classic Cinnamon Roll close-up",
    category: "rolls",
    availability: "coming-soon",
    featured: false,
    details: { inside: "رول سينامون كلاسيك واحدة", ingredients: null, allergens: null, size: null }
  }
];

window.JS_CATEGORIES = [
  { id: "boxes", name: "The Boxes", nameAr: "البوكسات", status: "live" },
  { id: "rolls", name: "The Rolls", nameAr: "الرولز", status: "live" },
  { id: "mini", name: "Mini Mood Box", nameAr: "ميني مود بوكس", status: "later", blurb: "A smaller box for smaller moods.", ar: "بوكس صغير لمود صغير." },
  { id: "celebration", name: "Celebration Treats", nameAr: "حاجات الاحتفالات", status: "later", blurb: "For birthdays, wins and everything in between.", ar: "لأعياد الميلاد والنجاحات وكل حاجة بينهم." },
  { id: "more", name: "More Little Treats", nameAr: "تريتس تانية", status: "later", blurb: "New desserts and snacks, when they're ready.", ar: "حلويات جديدة… لما تبقى جاهزة." }
];
