export interface Video {
  id: number;
  title: string;
  duration: string;
  views: number;
  thumbnail: string;
  videoUrl: string;
  embedId: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  author: string;
  year: number;
  thumbnail: string;
  totalVideos: number;
  totalDuration: string;
  videos: Video[];
}

// Courses with multiple videos
export const courses: Course[] = [
  {
    id: 1,
    title: "Cambodian Labor Law Complete Course",
    description: "Comprehensive guide to labor laws in Cambodia, covering employment rights, workplace safety, employee benefits, and legal compliance.",
    author: "Men Vuth",
    year: 2024,
    thumbnail: "https://img.youtube.com/vi/cXmTY-skFMQ/hqdefault.jpg",
    totalVideos: 5,
    totalDuration: "3h 45m",
    videos: [
      {
        id: 1,
        title: "Introduction to Cambodian Labor Law",
        duration: "45:30",
        views: 1250,
        thumbnail: "https://img.youtube.com/vi/cXmTY-skFMQ/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=cXmTY-skFMQ",
        embedId: "cXmTY-skFMQ",
      },
      {
        id: 2,
        title: "Employee Rights and Benefits",
        duration: "38:20",
        views: 980,
        thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        embedId: "jNQXAC9IVRw",
      },
      {
        id: 3,
        title: "Working Hours and Overtime Regulations",
        duration: "42:15",
        views: 750,
        thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        embedId: "9bZkp7q19f0",
      },
      {
        id: 4,
        title: "Workplace Safety and Health Standards",
        duration: "35:10",
        views: 620,
        thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
        embedId: "kJQP7kiw5Fk",
      },
      {
        id: 5,
        title: "Termination and Dispute Resolution",
        duration: "44:30",
        views: 540,
        thumbnail: "https://img.youtube.com/vi/ZbZSe6N_BXs/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=ZbZSe6N_BXs",
        embedId: "ZbZSe6N_BXs",
      },
    ],
  },
  {
    id: 2,
    title: "Land Law and Property Rights in Cambodia",
    description: "Detailed explanation of land ownership, property rights, real estate transactions, and legal procedures in the Kingdom of Cambodia.",
    author: "Men Vuth",
    year: 2024,
    thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
    totalVideos: 4,
    totalDuration: "2h 55m",
    videos: [
      {
        id: 1,
        title: "Understanding Land Ownership",
        duration: "52:15",
        views: 1120,
        thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        embedId: "fJ9rUzIMcZQ",
      },
      {
        id: 2,
        title: "Property Registration Process",
        duration: "38:45",
        views: 890,
        thumbnail: "https://img.youtube.com/vi/OPf0YbXjDZ0/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=OPf0YbXjDZ0",
        embedId: "OPf0YbXjDZ0",
      },
      {
        id: 3,
        title: "Real Estate Transactions",
        duration: "41:20",
        views: 730,
        thumbnail: "https://img.youtube.com/vi/M7FIvfx5J10/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=M7FIvfx5J10",
        embedId: "M7FIvfx5J10",
      },
      {
        id: 4,
        title: "Land Disputes and Resolution",
        duration: "43:25",
        views: 650,
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        embedId: "dQw4w9WgXcQ",
      },
    ],
  },
  {
    id: 3,
    title: "Corporate Law Essentials",
    description: "Essential concepts of corporate law including business registration, company structures, legal requirements, and corporate governance.",
    author: "Men Vuth",
    year: 2024,
    thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    totalVideos: 6,
    totalDuration: "4h 20m",
    videos: [
      {
        id: 1,
        title: "Introduction to Corporate Law",
        duration: "38:20",
        views: 1050,
        thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        embedId: "jNQXAC9IVRw",
      },
      {
        id: 2,
        title: "Business Registration Procedures",
        duration: "45:10",
        views: 920,
        thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        embedId: "9bZkp7q19f0",
      },
      {
        id: 3,
        title: "Company Structures and Types",
        duration: "42:30",
        views: 810,
        thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
        embedId: "kJQP7kiw5Fk",
      },
      {
        id: 4,
        title: "Corporate Governance",
        duration: "40:15",
        views: 720,
        thumbnail: "https://img.youtube.com/vi/ZbZSe6N_BXs/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=ZbZSe6N_BXs",
        embedId: "ZbZSe6N_BXs",
      },
      {
        id: 5,
        title: "Shareholder Rights and Responsibilities",
        duration: "36:45",
        views: 680,
        thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        embedId: "fJ9rUzIMcZQ",
      },
      {
        id: 6,
        title: "Corporate Compliance and Reporting",
        duration: "37:20",
        views: 590,
        thumbnail: "https://img.youtube.com/vi/OPf0YbXjDZ0/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=OPf0YbXjDZ0",
        embedId: "OPf0YbXjDZ0",
      },
    ],
  },
];

