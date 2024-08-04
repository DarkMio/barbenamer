import { css, cx } from "@linaria/core";
import { type CSSProperties, type ComponentProps, memo, useMemo } from "react";

const IconClass = css`
  display: inline-block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;

  background-repeat: no-repeat;
  mask-repeat: no-repeat;
  mask-size: contain;
  background-color: currentColor;

  &.size-xs,
  .size-xs > & {
    width: 12px;
    height: 12px;
  }

  &.size-s,
  .size-s > & {
    width: 20px;
    height: 20px;
  }

  &.size-m,
  .size-m > & {
    width: 24px;
    height: 24px;
  }

  &.size-l,
  .size-l > & {
    width: 32px;
    height: 32px;
  }

  &.size-xl,
  .size-xl > & {
    width: 48px;
    height: 48px;
  }

  &.size-xxl,
  .size-xxl > & {
    width: 96px;
    height: 96px;
  }
`;

const sizeToClass = {
  xs: "size-xs",
  s: "size-s",
  m: "size-m",
  l: "size-l",
  xl: "size-xl",
  xxl: "size-xxl",
} as const;

// eslint-disable-next-line react-refresh/only-export-components
const SvgIcon = ({
  size = "s",
  iconUrl,
  style,
  className,
  ...props
}: {
  // language="File Reference"
  size?: "xs" | "s" | "m" | "l" | "xl" | "xxl";
  iconUrl?: string;
} & ComponentProps<"div">) => {
  const combinedStyle = useMemo((): CSSProperties => {
    return {
      ...style,
      visibility: iconUrl ? undefined : "hidden",
      maskImage: iconUrl ? `url(${iconUrl})` : undefined,
      WebkitMaskImage: iconUrl ? `url(${iconUrl})` : undefined,
    };
  }, [style, iconUrl]);
  const sizeClassName = sizeToClass[size];

  const classNames = cx(IconClass, sizeClassName, className);
  return <div className={classNames} style={combinedStyle} {...props} />;
};

// eslint-disable-next-line react-refresh/only-export-components
export const Icon = memo(SvgIcon);
