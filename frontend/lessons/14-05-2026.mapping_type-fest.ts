import { Product, User } from "./learning.types";
import { AppPartialMapping } from "./learning.utils";
import type {
  CamelCasedPropertiesDeep,
  SnakeCasedPropertiesDeep,
  Jsonify,
  Simplify,
  Except,
} from "type-fest";

type UpdateProductDto = AppPartialMapping<
  Pick<Product, "title" | "price" | "status">
>;

const someProductUpdate: UpdateProductDto = {
  title: "ads",
  price: 100,
};

type ProductApiResponse = ReplaceDateFields<Product, string>;

const someProduct: Product = {
  id: "1",
  title: "Product 1",
  price: 100,
  status: "archived",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-02T00:00:00Z"),
};

const someProductResponse: ProductApiResponse = {
  ...someProduct,
  createdAt: someProduct.createdAt.toISOString(),
  updatedAt: someProduct.updatedAt.toISOString(),
};

type PublicUser = RemoveSensitiveFields<User>;

const someUser: PublicUser = {
  id: "1",
  email: "user@example.com",
  refreshToken: "some-refresh-token",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-02T00:00:00Z"),
};

const user = {
  name: "Alice",
  age: 30,
};

type getValueType = <T, K extends keyof T>(obj: T, key: K) => T[K];

const getValue: getValueType = (obj, key) => {
  return obj[key];
};

const value = getValue(user, "name");

type UpdateUserDto = Partial<Pick<User, "name" | "email">> & Pick<User, "id">;

type UpdateUserDto2 = Simplify<
  Partial<Pick<User, "name" | "email">> & Pick<User, "id">
>;

type Status = "loading" | "success" | "error" | "unknown";

function handleStatus(status: Status) {
  switch (status) {
    case "loading":
      return "loading";
    case "success":
      return "success";
    case "error":
      return "error";
    case "unknown":
      return "unknown";
    default:
      // eslint-disable-next-line no-case-declarations
      const impossible: never = status;
      return impossible;
  }
}

handleStatus("loading");
