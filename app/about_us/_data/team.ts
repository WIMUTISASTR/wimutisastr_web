export type TeamMember = {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  facebook?: string;
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
    facebook: "https://web.facebook.com/profile.php?id=61552023062511",
  },
  {
    name: "អុល លីហួ",
    role: "ប្រឹក្សាច្បាប់",
    phone: "095389323",
    email: "lyhour@gmail.com",
  },
];

export const EXPERT_SPECIALIZATIONS = [
  "ច្បាប់ដីធ្លី",
  "ច្បាប់ការងារ",
  "ច្បាប់សាជីវកម្ម",
  "ច្បាប់ការពារវិនិយោគ",
  "ដោះស្រាយវិវាទក្នុង និងក្រៅតុលាការ",
  "ការរៀបចំកិច្ចសន្យា",
];

export const EXPERT_EXPERIENCE = [
  { period: "2022–2023", detail: "មេធាវីអនុវត្តនៅ CPH LAW GROUP, ព្រះរាជាណាចក្រកម្ពុជា" },
  { period: "2012–2021", detail: "ក្រុមការងារផ្នែកច្បាប់នៅខុទ្ទកាល័យឯកឧត្តម ហ៊ុន ម៉ាណែត ខេត្តកំពង់ស្ពឺ" },
  { period: "2010 – បច្ចុប្បន្ន", detail: "គ្រូបង្រៀនក្រៅម៉ោងនៅសាកលវិទ្យាល័យភូមិន្ទនីតិសាស្ត្រ និងវិទ្យាសាស្ត្រសេដ្ឋកិច្ច" },
  { period: "2012–2015", detail: "ប្រធានផ្នែកកិច្ចការច្បាប់នៅក្រុមហ៊ុនធានារ៉ាប់រង CAMLIFE" },
  { period: "2010–2012", detail: "ជំនួយការផ្នែកច្បាប់នៅអយ្យការអមសាលាដំបូងរាជធានីភ្នំពេញ" },
];
