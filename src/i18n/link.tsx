import { Link as RouterLink, type LinkProps } from "@tanstack/react-router";
import { useLanguage } from "./hooks/use-language";

interface Props
  extends Omit<React.ComponentPropsWithoutRef<"a">, "children" | "target">,
    Omit<LinkProps, "children" | "target"> {
  target?: React.ComponentPropsWithoutRef<"a">["target"];
  children?: React.ReactNode;
}

export const Link: React.FC<Props> = ({ children, ...rest }) => {
  const { language } = useLanguage();

  return (
    <RouterLink
      {...rest}
      params={{
        lang: language.value,
        ...(rest.params as any),
      }}
      resetScroll={true}
      preload={"intent"}
      preloadDelay={500}
    >
      {children}
    </RouterLink>
  );
};

Link.displayName = "i18n-Link";
