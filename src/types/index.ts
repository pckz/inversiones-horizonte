export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  status: string;
  image_url: string;
  target_amount: number;
  raised_amount: number;
  min_investment: number;
  estimated_return_min: number;
  estimated_return_max: number;
  annual_return: number;
  duration_months: number;
  deadline: string | null;
  location: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  quote: string;
  project_name: string;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  attachments: Array<{ name: string; url: string; type: string }>;
  published_at: string;
}
