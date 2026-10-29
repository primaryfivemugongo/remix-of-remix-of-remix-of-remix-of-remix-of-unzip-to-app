export const school = {
  name: "Kyengera Parents' School - Mugongo",
  fullName: "Kyengera Parents Day and Boarding Primary School - Mugongo",
  network: "Sir Apollo Kaggwa Schools",
  motto: "Action Not Words",
  className: "Day & Boarding Primary School",
  phone: "+256 753 616 792",
  phoneHref: "tel:+256753616792",
  officePhone: "+256 704 281240",
  officePhoneHref: "tel:+256704281240",
  whatsappUrl: "https://wa.me/256704281240",
  hours: "Mon - Sat: 8:00 AM - 4:00 PM",
  website: "mugongo.sirapollokaggwaschools.co.ug",
  websiteUrl: "https://mugongo.sirapollokaggwaschools.co.ug",
  location: "Kyengera Mugongo",
  headTeacher: "Mperese John Bosco",
  mission:
    "To provide a stimulating and credible learning environment which will produce dynamic and talented young Ugandan citizens and ensure all learners are equipped to meet the challenges of life.",
  profile:
    "Kyengera Parents Day and Boarding Primary School - Mugongo provides world class education to the masses. Equipped with competent and high quality staff, we ensure that our children excel in National exams with only first grades. The school has two sections: pre-school and primary school.",
  values: [
    ["Care", "We respect the needs of our stakeholders and ensure they feel listened to and cared for."],
    ["Academic Excellence", "We dream big, set ambitious goals and aim to be the best at what we do."],
    ["Teamwork", "Our team works with the bigger picture in mind, putting the team's needs first."],
    ["Equality", "We value all members of the school community equally and practise tolerance, respect and patience."],
    ["Continuous Learning", "Open-minded curiosity fuels our passion for learning and improving."],
  ] as const,
};

/** Classes at the school. Only P.5 Orange currently has published records. */
export const schoolClasses = [
  { slug: "baby", name: "Baby Class", streams: [] as string[] },
  { slug: "middle", name: "Middle Class", streams: [] },
  { slug: "top", name: "Top Class", streams: [] },
  { slug: "p1", name: "Primary One", streams: [] },
  { slug: "p2", name: "Primary Two", streams: [] },
  { slug: "p3", name: "Primary Three", streams: [] },
  { slug: "p4", name: "Primary Four", streams: [] },
  { slug: "p5", name: "Primary Five", streams: ["Orange"] },
  { slug: "p6", name: "Primary Six", streams: [] },
  { slug: "p7", name: "Primary Seven", streams: [] },
];

export const activeStream = { classSlug: "p5", stream: "Orange", label: "P.5 Orange", pupils: 51 };

export function classHasInformation(slug: string) {
  return slug === activeStream.classSlug;
}
