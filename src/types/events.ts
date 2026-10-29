export interface TicketType {
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
}

export interface ScheduleItem {
  _id?: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionTitle: string;
  description: string;
  speaker: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  bannerImage?: string;
  videoUrl?: string;
  ticketTypes: TicketType[];
  schedule: ScheduleItem[];
  status: "pending" | "approved" | "rejected";
  organizer?: {
    _id: string;
    name: string;
  };

  createdAt: string;
  updatedAt: string;
}