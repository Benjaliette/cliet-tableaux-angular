export interface Painting {
  id: string;
  title: string;
  description: string;
  creationDate: string; // Format ISO 8601: "2023-10-27T10:00:00Z"
  technique: string | null;
  dimensions: {
    height: number | null;
    width: number | null;
  };
  sell: boolean;
  price: number | null;
  currency: string,
  imagePublicId: string;
  category: {
    id: string;
    name: string;
  };
}
