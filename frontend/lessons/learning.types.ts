export type Product = {
  id: string;
  title: string;
  price: number;
  status: "draft" | "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
};
