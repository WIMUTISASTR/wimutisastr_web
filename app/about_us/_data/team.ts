export type TeamMember = {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  facebook?: string;
};

export type ExpertEducation = {
  period: string;
  detail: string;
};

export type ExpertExperience = {
  period: string;
  title: string;
  ongoing?: boolean;
};

export type LeadExpert = {
  nameKh: string;
  nameLatin: string;
  title: string;
  bio: string;
  image: string;
  imageAlt: string;
  personal: {
    gender: string;
    nationality: string;
    dateOfBirth: string;
    birthplace: string;
  };
  education: ExpertEducation[];
  specializations: string[];
  experience: ExpertExperience[];
  languages: string[];
  contact: {
    phone: string;
    email: string;
    address: string;
    facebook?: string;
  };
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "ភ័ណ្ឌ  ស្រីលីស",
    role: "អនុប្រធានការិយាល័យមេធាវី",
    phone: "069789722",
    email: "sreylin@gmail.com",
  },
  {
    name: "ឌឹម ចាន់ឡេង",
    role: "ទីប្រឹក្សាច្បាប់ និងជំនួយការមេធាវី",
    phone: "095410815",
    email: "chanlengdem@gmail.com",
  },
  {
    name: "ឡយ សីហា",
    role: "ទីប្រឹក្សាច្បាប់ និងជំនួយការមេធាវី",
    phone: "0969155963",
    email: "seyhaloy@gmail.com",
  },
  {
    name: "Kheang Su iy",
    role: "ទីប្រឹក្សាច្បាប់",
    phone: "087596866",
    email: "kheang1916baobei@gmail.com",
  },
  {
    name: "មេធាវី ម៉ែន វុធ",
    role: "ប្រធានការិយាល័យវិមុត្តិសាស្ត្រ",
    phone: "0717251802",
    email: "avocatmenvuth@gmail.com",
    facebook: "https://www.facebook.com/profile.php?id=61567180603365",
  },
  {
    name: "អុល លីហួ",
    role: "ប្រឹក្សាច្បាប់",
    phone: "095389323",
    email: "lyhour@gmail.com",
  },
];

export const LEAD_EXPERT: LeadExpert = {
  nameKh: "មេធាវី ម៉ែន វុធ",
  nameLatin: "Men Vuth",
  title: "អ្នកជំនាញច្បាប់ · ប្រធានការិយាល័យវិមុត្តិសាស្ត្រ",
  bio: "ឯកសារ និងវីដេអូទាំងអស់លើវេទិកានេះត្រូវបានរៀបចំដោយអ្នកជំនាញច្បាប់របស់យើង ដើម្បីផ្តល់ចំណេះដឹងដែលអាចអនុវត្តបានជាក់ស្តែង។",
  image: "/asset/teacherImage.png",
  imageAlt: "មេធាវី ម៉ែន វុធ",
  personal: {
    gender: "ប្រុស",
    nationality: "ខ្មែរ",
    dateOfBirth: "5 ឧសភា 1984",
    birthplace: "ភូមិតាកវ៉ាន់ ឃុំឧត្តមសុរិយា ស្រុកត្រាំកក់ ខេត្តតាកែវ",
  },
  education: [
    {
      period: "2006–2010",
      detail:
        "បរិញ្ញាបត្រនីតិសាស្ត្រ (ឯកទេសភាសាបារាំង), សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច",
    },
    {
      period: "2010–2013",
      detail:
        "បរិញ្ញាបត្រជាន់ខ្ពស់ផ្នែកច្បាប់អន្តរជាតិ និងប្រៀបធៀប, សាកលវិទ្យាល័យ Lyon II និង សាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ",
    },
  ],
  specializations: [
    "ច្បាប់ដីធ្លី",
    "ច្បាប់ការងារ",
    "ច្បាប់សាជីវកម្ម",
    "ច្បាប់ការពារវិនិយោគ",
    "ដោះស្រាយវិវាទក្នុង និងក្រៅតុលាការ",
    "ការរៀបចំកិច្ចសន្យា",
  ],
  experience: [
    {
      period: "ឆ្នាំ ២០២៥",
      title:
        "សមាជិកក្រុមការងារប្រតិបត្តិការនិងនីតិវិធីនៃលេខាធិការរដ្ឋាន នៃគណៈកម្មការចំពោះកិច្ចប្រយុទ្ធប្រឆាំង ការឆបោកតាមប្រព័ន្ធបច្ចេកវិទ្យា (ONLINE SCAMS)",
    },
    {
      period: "ខែសីហា ឆ្នាំ ២០២៣ – បច្ចុប្បន្ន",
      title:
        "ជាសមាជិកក្រុមលេខា សម្តេចធិបតី ហ៊ុន ម៉ាណែត នាយករដ្ឋមន្ត្រីនៃព្រះរាជាណាចក្រកម្ពុជា",
      ongoing: true,
    },
    {
      period: "ខែវិច្ឆិកា ឆ្នាំ ២០២៣ – បច្ចុប្បន្ន",
      title: "សមាជិកក្រុមការងារពិសេសរបស់នាយករដ្ឋមន្ត្រីលើកិច្ចការអន្តរាគមន៍ទី១",
      ongoing: true,
    },
    {
      period: "ខែកញ្ញា ឆ្នាំ ២០២៣ – បច្ចុប្បន្ន",
      title: "ប្រធានការិយាល័យមេធាវីវិមុត្តិសាស្ត្រ",
      ongoing: true,
    },
    {
      period: "ខែកុម្ភៈ ឆ្នាំ ២០២២",
      title:
        "សមាជិកក្រុមការងារតាមការអនុវត្តគោលការណ៍របស់នាយករដ្ឋមន្ត្រីពាក់ព័ន្ធការងារសន្តិសុខសណ្តាប់ធ្នាប់សង្គម",
    },
    {
      period: "២០១២ – ២០១៥",
      title: "ប្រធានការិយាល័យច្បាប់នៃក្រុមហ៊ុនធានារ៉ាប់រងអាយុជីវិតខេមឡែហ៍",
    },
    {
      period: "២០១០ – ២០១២",
      title: "ជំនួយការមេធាវីនៃអង្គភាពគាំពារជនរងគ្រោះនៃសាលាក្តីខ្មែរក្រហម",
    },
    {
      period: "២០១០ – បច្ចុប្បន្ន",
      title:
        "សាស្ត្រាចារ្យវេលាកាលនៃសាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច (RULE)",
      ongoing: true,
    },
  ],
  languages: ["ខ្មែរ — ភាសាកំណើត", "អង់គ្លេស", "បារាំង"],
  contact: {
    phone: "0717251802",
    email: "avocatmenvuth@gmail.com",
    address: "ផ្ទះលេខ 24Q ផ្លូវលេខ 36 ភូមិភ្នំពេញថ្មី ឃុំព្រែកអញ្ចាញ ស្រុកមុខកំពូល ខេត្តកណ្ដាល",
    facebook: "https://www.facebook.com/profile.php?id=61567180603365",
  },
};
