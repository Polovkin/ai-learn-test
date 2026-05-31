const wait = (ms: number, value: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
};

const boom = () => {
  return new Promise<string>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Boom!"));
    }, 1000);
  });
};

export const playground = async () => {
  await Promise.any([wait(3000, "A"), boom(), wait(2000, "C")]).then(
    (values) => {
      console.log(values);
    },
  );
};
