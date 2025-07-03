export function parseCookies(cookieString: string): Record<string, string> {
  if (!cookieString) return {};
  return cookieString.split(";").reduce(
    (acc, pair) => {
      const [key, ...rest] = pair.trim().split("=");
      if (key && rest.length > 0) {
        acc[key] = decodeURIComponent(rest.join("="));
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}

// Example usage:
// const cookieString = "name=JohnDoe; age=30; city=NewYork";
// const cookies = parseCookies(cookieString);
// console.log(cookies); // { name: "JohnDoe", age: "30", city: "NewYork" }
