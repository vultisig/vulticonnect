import type { FC, SVGProps } from "react";

export const ShareArrowIcon = ({ ...props }) => (
  <svg
    width="20"
    height="26"
    viewBox="0 0 20 26"
    fill="none"
    {...props}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.9037 21.4363V17.12L10.8323 15.1819L11.843 16.2283L12.9132 17.3222C13.0004 17.4094 13.0995 17.4768 13.2104 17.5244C13.3214 17.5719 13.4363 17.5956 13.5553 17.5956C13.7931 17.5956 13.9913 17.5184 14.1498 17.3638C14.3083 17.2092 14.3876 17.0131 14.3876 16.7752C14.3876 16.6405 14.3618 16.5215 14.3103 16.4185C14.2588 16.3155 14.1855 16.2204 14.0904 16.1332L10.6659 12.9822C10.539 12.8632 10.4261 12.782 10.327 12.7384C10.2279 12.6948 10.1189 12.673 9.99999 12.673C9.88108 12.673 9.77209 12.6948 9.673 12.7384C9.57391 12.782 9.46095 12.8632 9.33412 12.9822L5.90963 16.1332C5.8145 16.2204 5.74118 16.3155 5.68965 16.4185C5.63813 16.5215 5.61237 16.6405 5.61237 16.7752C5.61237 17.0131 5.69164 17.2092 5.85017 17.3638C6.00871 17.5184 6.20689 17.5956 6.4447 17.5956C6.55568 17.5956 6.66864 17.5719 6.78358 17.5244C6.89853 17.4768 6.99959 17.4094 7.08679 17.3222L8.15695 16.2283L9.16765 15.1819L9.0963 17.12V21.4363C9.0963 21.6741 9.18548 21.8803 9.36384 22.0547C9.5422 22.2291 9.75425 22.3163 9.99999 22.3163C10.2457 22.3163 10.4578 22.2291 10.6361 22.0547C10.8145 21.8803 10.9037 21.6741 10.9037 21.4363ZM3.68608 25.7407H16.3138C17.5426 25.7407 18.4641 25.4296 19.0784 24.8073C19.6928 24.1851 20 23.2556 20 22.019V11.2223C20 10.7071 19.9722 10.2751 19.9167 9.92626C19.8613 9.57747 19.7523 9.2584 19.5898 8.96907C19.4273 8.67973 19.1875 8.37255 18.8703 8.04754L12.3187 1.37692C12.0174 1.06777 11.7241 0.831935 11.4387 0.669431C11.1534 0.506926 10.8422 0.395947 10.5053 0.336494C10.1684 0.277041 9.77803 0.247314 9.33412 0.247314H3.68608C2.45739 0.247314 1.53587 0.560433 0.921521 1.18667C0.307174 1.81291 0 2.74434 0 3.98097V22.019C0 23.2636 0.307174 24.195 0.921521 24.8133C1.53587 25.4316 2.45739 25.7407 3.68608 25.7407ZM3.76931 23.8263C3.15893 23.8263 2.69718 23.6678 2.38407 23.3507C2.07095 23.0337 1.91439 22.5779 1.91439 21.9834V4.01663C1.91439 3.43003 2.07095 2.97423 2.38407 2.64922C2.69718 2.32421 3.1629 2.16171 3.78121 2.16171H9.07252V9.07013C9.07252 9.81527 9.25881 10.3741 9.63138 10.7467C10.004 11.1193 10.5628 11.3056 11.308 11.3056H18.0856V21.9834C18.0856 22.5779 17.929 23.0337 17.6159 23.3507C17.3028 23.6678 16.837 23.8263 16.2188 23.8263H3.76931ZM11.522 9.51008C11.2842 9.51008 11.1157 9.45856 11.0166 9.35551C10.9175 9.25246 10.868 9.08203 10.868 8.84422V2.53031L17.717 9.51008H11.522Z"
      fill="white"
    />
  </svg>
);

export const ArrowRounded: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M19.75 20.2475H5.25C3.73 20.2475 2.5 19.0175 2.5 17.4975V7.9975C2.5 7.5875 2.84 7.2475 3.25 7.2475C3.66 7.2475 4 7.5875 4 7.9975V17.4975C4 18.1875 4.56 18.7475 5.25 18.7475H19.75C20.16 18.7475 20.5 19.0875 20.5 19.4975C20.5 19.9075 20.16 20.2475 19.75 20.2475ZM8.25 14.7475C7.84 14.7475 7.5 14.4075 7.5 13.9975V12.9975C7.5 9.8275 10.08 7.2475 13.25 7.2475H18.94L16.72 5.0275C16.43 4.7375 16.43 4.2575 16.72 3.9675C17.01 3.6775 17.49 3.6775 17.78 3.9675L21.28 7.4675C21.35 7.5375 21.41 7.6175 21.44 7.7075C21.48 7.7975 21.5 7.8975 21.5 7.9975C21.5 8.0975 21.48 8.1975 21.44 8.2875C21.4 8.3775 21.35 8.4575 21.28 8.5275L17.78 12.0275C17.49 12.3175 17.01 12.3175 16.72 12.0275C16.43 11.7375 16.43 11.2575 16.72 10.9675L18.94 8.7475H13.25C10.91 8.7475 9 10.6575 9 12.9975V13.9975C9 14.4075 8.66 14.7475 8.25 14.7475Z" />
  </svg>
);

export const BrokenLink: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M21.9999 8.92C21.9999 7.07 21.2799 5.33 19.9699 4.03C18.6599 2.72 16.9299 2 15.0799 2C13.2299 2 11.4899 2.72 10.1899 4.03L9.21994 5C8.92994 5.29 8.92994 5.77 9.21994 6.06C9.50994 6.35 9.98994 6.35 10.2799 6.06L11.2499 5.09C12.2699 4.07 13.6299 3.5 15.0799 3.5C16.5299 3.5 17.8899 4.06 18.9099 5.09C19.9299 6.11 20.4999 7.47 20.4999 8.92C20.4999 10.37 19.9399 11.73 18.9099 12.75L17.9399 13.72C17.6499 14.01 17.6499 14.49 17.9399 14.78C18.0899 14.93 18.2799 15 18.4699 15C18.6599 15 18.8499 14.93 18.9999 14.78L19.9699 13.81C21.2799 12.5 21.9999 10.77 21.9999 8.92Z" />
    <path d="M13.7198 17.95L12.7598 18.91C11.7398 19.93 10.3798 20.5 8.92977 20.5C7.47977 20.5 6.11977 19.94 5.09977 18.91C4.07977 17.89 3.50977 16.53 3.50977 15.08C3.50977 13.63 4.06977 12.27 5.09977 11.25L6.06977 10.28C6.35977 9.99 6.35977 9.51 6.06977 9.22C5.77977 8.93 5.29977 8.93 5.00977 9.22L4.03977 10.19C2.72977 11.5 2.00977 13.23 2.00977 15.08C2.00977 16.93 2.72977 18.67 4.03977 19.97C5.34977 21.28 7.07977 22 8.92977 22C10.7798 22 12.5198 21.28 13.8198 19.97L14.7798 19.01C15.0698 18.72 15.0698 18.24 14.7798 17.95C14.4898 17.66 14.0098 17.66 13.7198 17.95Z" />
    <path d="M3.80019 7.10998C4.14019 7.10998 4.44019 6.87998 4.53019 6.53998C4.63019 6.13998 4.39019 5.72998 3.98019 5.62998L1.93019 5.11998C1.53019 5.01998 1.12019 5.25998 1.02019 5.66998C0.92019 6.06998 1.16019 6.47998 1.57019 6.57998L3.62019 7.08998C3.68019 7.10998 3.74019 7.10998 3.80019 7.10998Z" />
    <path d="M5.6302 3.98002C5.7102 4.32002 6.0202 4.55002 6.3602 4.55002C6.4202 4.55002 6.4802 4.55002 6.5402 4.53002C6.9402 4.43002 7.1902 4.02002 7.0902 3.62002L6.5802 1.57002C6.4802 1.17002 6.0702 0.930024 5.6702 1.02002C5.2702 1.12002 5.0202 1.53002 5.1202 1.93002L5.6302 3.98002Z" />
    <path d="M18.3702 20.02C18.2702 19.62 17.8602 19.37 17.4602 19.47C17.0602 19.57 16.8102 19.98 16.9102 20.38L17.4202 22.43C17.5002 22.77 17.8102 23 18.1502 23C18.2102 23 18.2702 23 18.3302 22.98C18.7302 22.88 18.9802 22.47 18.8802 22.07L18.3702 20.02Z" />
    <path d="M22.4299 17.42L20.3799 16.91C19.9799 16.81 19.5699 17.05 19.4699 17.46C19.3699 17.86 19.6099 18.27 20.0199 18.37L22.0699 18.88C22.1299 18.9 22.1899 18.9 22.2499 18.9C22.5899 18.9 22.8899 18.67 22.9799 18.33C23.0799 17.93 22.8399 17.52 22.4299 17.42Z" />
  </svg>
);

export const BrokenLinkBold: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M22.5001 9.17C22.5001 7.25 21.7501 5.45 20.4001 4.1C19.0501 2.75 17.2501 2 15.3301 2C13.4101 2 11.6101 2.75 10.2601 4.1L9.29006 5.07C8.90006 5.46 8.90006 6.09 9.29006 6.48C9.68006 6.87 10.3101 6.87 10.7001 6.48L11.6701 5.51C12.6501 4.53 13.9401 4 15.3301 4C16.7201 4 18.0101 4.54 18.9901 5.51C19.9701 6.48 20.5001 7.78 20.5001 9.17C20.5001 10.56 19.9601 11.85 18.9901 12.83L18.0201 13.8C17.6301 14.19 17.6301 14.82 18.0201 15.21C18.2201 15.41 18.4701 15.5 18.7301 15.5C18.9901 15.5 19.2401 15.4 19.4401 15.21L20.4101 14.24C21.7601 12.89 22.5101 11.09 22.5101 9.17H22.5001Z" />
    <path d="M13.79 18.02L12.83 18.98C11.85 19.96 10.56 20.49 9.17 20.49C7.78 20.49 6.49 19.95 5.51 18.98C4.53 18.01 4 16.71 4 15.32C4 13.93 4.54 12.64 5.51 11.66L6.48 10.69C6.87 10.3 6.87 9.66999 6.48 9.27999C6.09 8.88999 5.46 8.88999 5.07 9.27999L4.1 10.25C2.75 11.6 2 13.4 2 15.32C2 17.24 2.75 19.04 4.1 20.39C5.45 21.74 7.25 22.49 9.17 22.49C11.09 22.49 12.89 21.74 14.24 20.39L15.2 19.43C15.59 19.04 15.59 18.41 15.2 18.02C14.81 17.63 14.18 17.63 13.79 18.02Z" />
    <path d="M5.63998 4.29C5.74998 4.74 6.15998 5.05 6.60998 5.05C6.68998 5.05 6.76998 5.05 6.84998 5.02C7.38998 4.89 7.70998 4.34 7.57998 3.81L7.06998 1.76C6.93998 1.22 6.38998 0.9 5.85998 1.03C5.31998 1.16 4.99998 1.71 5.12998 2.24L5.63998 4.29Z" />
    <path d="M4.04988 7.60998C4.49988 7.60998 4.90988 7.30998 5.01988 6.84998C5.14988 6.30998 4.82988 5.76998 4.28988 5.63998L2.23988 5.12998C1.70988 4.99998 1.15988 5.31998 1.02988 5.85998C0.899878 6.39998 1.21988 6.93998 1.75988 7.06998L3.80988 7.57998C3.88988 7.59998 3.96988 7.60998 4.04988 7.60998Z" />
    <path d="M18.86 20.21C18.73 19.67 18.18 19.35 17.65 19.48C17.11 19.61 16.79 20.16 16.92 20.69L17.43 22.74C17.54 23.2 17.95 23.5 18.4 23.5C18.48 23.5 18.56 23.5 18.64 23.47C19.18 23.34 19.5 22.79 19.37 22.26L18.86 20.21Z" />
    <path d="M22.7401 17.43L20.6901 16.92C20.1501 16.78 19.6101 17.11 19.4801 17.65C19.3501 18.19 19.6701 18.73 20.2101 18.86L22.2601 19.37C22.3401 19.39 22.4201 19.4 22.5001 19.4C22.9501 19.4 23.3601 19.1 23.4701 18.64C23.6001 18.1 23.2801 17.56 22.7401 17.43Z" />
  </svg>
);

export const ChevronLeft: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M14.0002 7.26996C14.1997 7.26996 14.3993 7.34978 14.539 7.49944C14.8185 7.79876 14.8085 8.26771 14.5091 8.55706L10.8667 12.0093L14.5191 15.4615C14.8185 15.7409 14.8284 16.2198 14.539 16.5191C14.2596 16.8185 13.7806 16.8284 13.4812 16.5391L9.63919 12.8973C9.38971 12.6678 9.25 12.3385 9.25 11.9993C9.25 11.6601 9.38971 11.3408 9.63919 11.1013L13.4812 7.45953C13.6309 7.31984 13.8106 7.25 14.0002 7.25L14.0002 7.26996Z" />
  </svg>
);

export const ChevronRight: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M9.99984 16.73C9.80025 16.73 9.60067 16.6502 9.46096 16.5006C9.18153 16.2012 9.19151 15.7323 9.49089 15.4429L13.1333 11.9907L9.48091 8.53849C9.18153 8.25912 9.17156 7.7802 9.46096 7.48087C9.74038 7.18155 10.2194 7.17157 10.5188 7.46092L14.3608 11.1027C14.6103 11.3322 14.75 11.6615 14.75 12.0007C14.75 12.3399 14.6103 12.6592 14.3608 12.8987L10.5188 16.5405C10.3691 16.6802 10.1894 16.75 9.99984 16.75V16.73Z" />
  </svg>
);

export const CircleDollar: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 22C6.49 22 2 17.51 2 12C2 6.49 6.49 2 12 2C17.51 2 22 6.49 22 12C22 17.51 17.51 22 12 22ZM12 3.5C7.31 3.5 3.5 7.31 3.5 12C3.5 16.69 7.31 20.5 12 20.5C16.69 20.5 20.5 16.69 20.5 12C20.5 7.31 16.69 3.5 12 3.5ZM12 18.4C11.59 18.4 11.25 18.06 11.25 17.65V16.79C10.39 16.62 9.64 16.18 9.17 15.52C8.93 15.18 9 14.72 9.34 14.47C9.67 14.23 10.14 14.3 10.39 14.64C10.71 15.08 11.33 15.36 12.01 15.36H12.2C13.08 15.36 13.83 14.83 13.83 14.2C13.83 13.79 13.5 13.4 12.98 13.19L10.47 12.19C9.38 11.76 8.68 10.81 8.68 9.79C8.68 8.43 9.8 7.36 11.25 7.16V6.34C11.25 5.93 11.59 5.59 12 5.59C12.41 5.59 12.75 5.93 12.75 6.34V7.2C13.61 7.37 14.36 7.81 14.83 8.47C15.07 8.81 15 9.27 14.66 9.52C14.32 9.76 13.86 9.69 13.61 9.35C13.29 8.91 12.67 8.63 11.99 8.63H11.7C10.87 8.63 10.17 9.12 10.17 9.71C10.17 10.2 10.5 10.59 11.02 10.8L13.53 11.8C14.62 12.23 15.32 13.18 15.32 14.2C15.32 15.5 14.21 16.59 12.75 16.81V17.64C12.75 18.05 12.41 18.39 12 18.39V18.4Z" />
  </svg>
);

export const CircleQuestion: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 22C6.49 22 2 17.51 2 12C2 6.49 6.49 2 12 2C17.51 2 22 6.49 22 12C22 17.51 17.51 22 12 22ZM12 3.5C7.31 3.5 3.5 7.31 3.5 12C3.5 16.69 7.31 20.5 12 20.5C16.69 20.5 20.5 16.69 20.5 12C20.5 7.31 16.69 3.5 12 3.5ZM12 17C11.45 17 11 16.55 11 16C11 15.45 11.45 15 12 15C12.55 15 13 15.45 13 16C13 16.55 12.55 17 12 17ZM12 14C11.59 14 11.25 13.66 11.25 13.25V13.07C11.25 12.15 11.71 11.29 12.47 10.78L13.03 10.41C13.32 10.22 13.49 9.89 13.49 9.54C13.49 8.97 13.02 8.5 12.45 8.5H11.24C10.83 8.5 10.49 8.84 10.49 9.25C10.49 9.66 10.15 10 9.74 10C9.33 10 8.99 9.66 8.99 9.25C8.99 8.01 10 7 11.24 7H12.45C13.85 7 14.99 8.14 14.99 9.54C14.99 10.39 14.57 11.18 13.86 11.65L13.3 12.02C12.95 12.25 12.74 12.64 12.74 13.06V13.24C12.74 13.65 12.4 13.99 11.99 13.99L12 14Z" />
  </svg>
);

export const CrossShape: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M19.2499 19.9999C19.0599 19.9999 18.8699 19.9299 18.7199 19.7799L11.9999 13.0599L5.27994 19.7799C4.98994 20.0699 4.50994 20.0699 4.21994 19.7799C3.92994 19.4899 3.92994 19.0099 4.21994 18.7199L10.9399 11.9999L4.21994 5.27994C3.92994 4.98994 3.92994 4.50994 4.21994 4.21994C4.50994 3.92994 4.98994 3.92994 5.27994 4.21994L11.9999 10.9399L18.7199 4.21994C19.0099 3.92994 19.4899 3.92994 19.7799 4.21994C20.0699 4.50994 20.0699 4.98994 19.7799 5.27994L13.0599 11.9999L19.7799 18.7199C20.0699 19.0099 20.0699 19.4899 19.7799 19.7799C19.6299 19.9299 19.4399 19.9999 19.2499 19.9999Z" />
  </svg>
);

export const CrossShapeBold: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M19.5001 20.5C19.2401 20.5 18.9901 20.4 18.7901 20.21L12.2501 13.67L5.71006 20.21C5.32006 20.6 4.69006 20.6 4.30006 20.21C3.91006 19.82 3.91006 19.19 4.30006 18.8L10.8401 12.26L4.29006 5.71C3.90006 5.32 3.90006 4.68 4.29006 4.29C4.68006 3.9 5.32006 3.9 5.71006 4.29L12.2501 10.83L18.7901 4.29C19.1801 3.9 19.8101 3.9 20.2001 4.29C20.5901 4.68 20.5901 5.31 20.2001 5.7L13.6601 12.24L20.2001 18.78C20.5901 19.17 20.5901 19.8 20.2001 20.19C20.0001 20.39 19.7501 20.48 19.4901 20.48L19.5001 20.5Z" />
  </svg>
);

export const EditShape: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M6.17847 20.95H18.0427C18.9523 20.95 19.662 20.6899 20.1617 20.1697C20.6615 19.6496 20.9114 18.8593 20.9114 17.819V6.98535L19.2821 8.6159V17.7289C19.2821 18.2591 19.1622 18.6492 18.9123 18.9193C18.6624 19.1894 18.3626 19.3195 18.0228 19.3195H6.20845C5.6987 19.3195 5.31888 19.1894 5.03902 18.9193C4.76915 18.6492 4.62921 18.2591 4.62921 17.7289V6.2351C4.62921 5.70493 4.76915 5.3148 5.03902 5.04471C5.30889 4.77462 5.6987 4.63457 6.20845 4.63457H15.414L17.0432 3.00403H6.17847C5.12897 3.00403 4.33935 3.26411 3.79961 3.78429C3.26987 4.30446 3 5.09472 3 6.13507V17.799C3 18.8493 3.26987 19.6296 3.79961 20.1497C4.32936 20.6699 5.11898 20.93 6.17847 20.93V20.95Z" />
    <path d="M9.8567 14.3879L11.8257 13.5276L21.2712 4.07444L19.8919 2.70398L10.4564 12.1571L9.54685 14.0578C9.50687 14.1478 9.52686 14.2278 9.60682 14.3178C9.68678 14.3979 9.76674 14.4279 9.86669 14.3879H9.8567Z" />
    <path d="M22.0107 3.33335L22.7403 2.58335C22.9102 2.40335 22.9902 2.20335 23.0002 1.98335C23.0002 1.76335 22.9202 1.57335 22.7403 1.40335L22.5104 1.16335C22.3505 1.00335 22.1706 0.933346 21.9507 0.953346C21.7308 0.973346 21.5409 1.05335 21.371 1.21335L20.6313 1.94335L22.0107 3.34335V3.33335Z" />
  </svg>
);

export const GearShape: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M11.0089 22.5H12.9911C13.3706 22.5 13.6961 22.3936 13.9675 22.1808C14.239 21.9679 14.4173 21.6782 14.5024 21.3115L14.9243 19.4748L15.2384 19.3667L16.8379 20.3489C17.1519 20.5519 17.4822 20.6305 17.829 20.5847C18.1758 20.5388 18.4833 20.3816 18.7515 20.1132L20.1253 18.7479C20.3935 18.4793 20.5505 18.1716 20.5963 17.8246C20.6421 17.4775 20.5636 17.1468 20.3608 16.8325L19.3598 15.2414L19.4776 14.9467L21.3127 14.5146C21.6725 14.4294 21.9603 14.2492 22.1762 13.9742C22.3921 13.6993 22.5 13.3751 22.5 13.0018V11.057C22.5 10.6838 22.3921 10.3597 22.1762 10.0846C21.9603 9.80962 21.6725 9.62955 21.3127 9.54442L19.4973 9.10241L19.3697 8.7881L20.3706 7.1969C20.5734 6.88259 20.6519 6.55355 20.6061 6.20977C20.5603 5.86599 20.4033 5.55659 20.1351 5.28157L18.7612 3.90645C18.4995 3.64452 18.1954 3.49064 17.8486 3.4448C17.5019 3.39896 17.1715 3.47427 16.8575 3.67071L15.258 4.65294L14.9243 4.52525L14.5024 2.68849C14.4173 2.32834 14.239 2.04022 13.9675 1.82413C13.6961 1.60804 13.3706 1.5 12.9911 1.5H11.0089C10.6294 1.5 10.304 1.60804 10.0325 1.82413C9.761 2.04022 9.58272 2.32834 9.49767 2.68849L9.0659 4.52525L8.73226 4.65294L7.14253 3.67071C6.82197 3.47427 6.48996 3.39896 6.1465 3.4448C5.80305 3.49064 5.49721 3.64452 5.22898 3.90645L3.86496 5.28157C3.59019 5.55659 3.43154 5.86599 3.38902 6.20977C3.3465 6.55355 3.42664 6.88259 3.62944 7.1969L4.62057 8.7881L4.50281 9.10241L2.68738 9.54442C2.32103 9.62955 2.03154 9.80962 1.81893 10.0846C1.60631 10.3597 1.5 10.6838 1.5 11.057V13.0018C1.5 13.3751 1.60794 13.6993 1.82383 13.9742C2.03972 14.2492 2.32757 14.4294 2.68738 14.5146L4.52243 14.9467L4.63038 15.2414L3.63926 16.8325C3.43645 17.1468 3.35631 17.4775 3.39884 17.8246C3.44135 18.1716 3.6 18.4793 3.87477 18.7479L5.23879 20.1132C5.50702 20.3816 5.81449 20.5388 6.16122 20.5847C6.50795 20.6305 6.8416 20.5519 7.16216 20.3489L8.75189 19.3667L9.0659 19.4748L9.49767 21.3115C9.58272 21.6782 9.761 21.9679 10.0325 22.1808C10.304 22.3936 10.6294 22.5 11.0089 22.5ZM11.1659 20.9678C11.0024 20.9678 10.9075 20.8924 10.8813 20.7419L10.2925 18.3059C9.9916 18.2339 9.70539 18.1406 9.43389 18.026C9.16239 17.9113 8.92197 17.7886 8.71263 17.6577L6.57338 18.9738C6.45562 19.0589 6.33459 19.0426 6.21029 18.9247L5.05235 17.7657C4.94767 17.6674 4.93459 17.5462 5.01309 17.4022L6.32805 15.2807C6.21683 15.0711 6.10235 14.8321 5.98459 14.5636C5.86683 14.2951 5.7687 14.0103 5.69019 13.7091L3.25655 13.1296C3.10608 13.1033 3.03085 13.0084 3.03085 12.8447V11.2044C3.03085 11.0472 3.10608 10.9523 3.25655 10.9195L5.68039 10.3302C5.75888 10.0093 5.86192 9.71139 5.98949 9.43637C6.11706 9.16135 6.22337 8.93217 6.30842 8.74881L5.00328 6.62721C4.91824 6.48315 4.92805 6.35547 5.03271 6.24415L6.20047 5.10476C6.31823 4.99999 6.44253 4.98362 6.57338 5.05565L8.693 6.34236C8.90234 6.2245 9.14931 6.10663 9.43389 5.98876C9.71847 5.8709 10.008 5.77268 10.3024 5.69409L10.8813 3.25818C10.9075 3.10757 11.0024 3.03227 11.1659 3.03227H12.8341C12.9976 3.03227 13.0893 3.10757 13.1089 3.25818L13.7075 5.71374C14.0149 5.79232 14.3011 5.88891 14.5661 6.0035C14.8311 6.1181 15.0715 6.23433 15.2874 6.35219L17.4168 5.05565C17.5542 4.98362 17.6818 4.99999 17.7996 5.10476L18.9575 6.24415C19.0687 6.35547 19.0785 6.48315 18.9869 6.62721L17.6818 8.74881C17.7733 8.93217 17.8814 9.16135 18.0057 9.43637C18.13 9.71139 18.2313 10.0093 18.3098 10.3302L20.7435 10.9195C20.8939 10.9523 20.9692 11.0472 20.9692 11.2044V12.8447C20.9692 13.0084 20.8939 13.1033 20.7435 13.1296L18.3001 13.7091C18.2216 14.0103 18.125 14.2951 18.0106 14.5636C17.8961 14.8321 17.78 15.0711 17.6622 15.2807L18.9772 17.4022C19.0622 17.5462 19.0491 17.6674 18.9379 17.7657L17.7897 18.9247C17.6654 19.0426 17.5411 19.0589 17.4168 18.9738L15.2776 17.6577C15.0682 17.7886 14.8294 17.9113 14.5612 18.026C14.293 18.1406 14.0084 18.2339 13.7075 18.3059L13.1089 20.7419C13.0893 20.8924 12.9976 20.9678 12.8341 20.9678H11.1659ZM12 15.7521C12.6869 15.7521 13.3134 15.5834 13.8792 15.2463C14.4451 14.909 14.8965 14.4556 15.2334 13.8859C15.5704 13.3162 15.7388 12.6875 15.7388 12.0001C15.7388 11.319 15.5704 10.6953 15.2334 10.1288C14.8965 9.56244 14.4451 9.11061 13.8792 8.77338C13.3134 8.43615 12.6869 8.26753 12 8.26753C11.3131 8.26753 10.6867 8.43615 10.1208 8.77338C9.55492 9.11061 9.10189 9.56244 8.76169 10.1288C8.42151 10.6953 8.25141 11.319 8.25141 12.0001C8.25141 12.6875 8.42151 13.3145 8.76169 13.881C9.10189 14.4474 9.55492 14.9008 10.1208 15.2414C10.6867 15.5818 11.3131 15.7521 12 15.7521ZM12 14.2296C11.5944 14.2296 11.2232 14.1297 10.8862 13.9301C10.5493 13.7303 10.2811 13.4618 10.0816 13.1247C9.88202 12.7874 9.78226 12.4125 9.78226 12.0001C9.78226 11.594 9.88202 11.224 10.0816 10.8901C10.2811 10.5561 10.5493 10.2893 10.8862 10.0896C11.2232 9.88984 11.5944 9.78998 12 9.78998C12.399 9.78998 12.7654 9.88984 13.0991 10.0896C13.4327 10.2893 13.6993 10.5561 13.8989 10.8901C14.0984 11.224 14.1981 11.594 14.1981 12.0001C14.1981 12.406 14.0984 12.7775 13.8989 13.1149C13.6993 13.452 13.4327 13.7222 13.0991 13.9252C12.7654 14.1281 12.399 14.2296 12 14.2296Z" />
  </svg>
);

export const QRCodeBorder: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M14.6154 0H9.38464V0.153846H14.6154V0Z" />
    <path d="M14.6154 23.8462H9.38464V24H14.6154V23.8462Z" />
    <path d="M23.8461 19.8462V22.4616C23.8461 23.2254 23.2254 23.8462 22.4615 23.8462H19.8461V24H22.4615C23.3115 24 24 23.3116 24 22.4616V19.8462H23.8461Z" />
    <path d="M22.4615 0.153846C23.2254 0.153846 23.8461 0.774615 23.8461 1.53846V4.15385H24V1.53846C24 0.688462 23.3115 0 22.4615 0H19.8461V0.153846H22.4615Z" />
    <path d="M1.20615 23.8039C0.603077 23.6547 0.153846 23.11 0.153846 22.4616V19.8462H0V22.4616C0 23.3116 0.688462 24 1.53846 24H4.15385V23.8839H1.69231C1.52231 23.8839 1.35923 23.8554 1.20615 23.8047V23.8039Z" />
    <path d="M0.153846 4.15385V1.53846C0.153846 0.774615 0.774615 0.153846 1.53846 0.153846H4.15385V0H1.53846C0.688462 0 0 0.688462 0 1.53846V4.15385H0.153846Z" />
    <path d="M24 9.38464H23.8461V14.6154H24V9.38464Z" />
    <path d="M0.153846 9.38464H0V14.6154H0.153846V9.38464Z" />
  </svg>
);

export const SettingsGear: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 23C11.59 23 11.25 22.66 11.25 22.25V20.97C10.18 20.88 9.13 20.6 8.16 20.14L7.52 21.25C7.31 21.61 6.85 21.73 6.5 21.52C6.15 21.31 6.02 20.85 6.23 20.5L6.87 19.39C5.99 18.78 5.22 18.01 4.61 17.13L3.5 17.77C3.14 17.98 2.68 17.85 2.48 17.5C2.27 17.14 2.4 16.68 2.75 16.48L3.86 15.84C3.4 14.87 3.12 13.82 3.03 12.75H1.75C1.34 12.75 1 12.41 1 12C1 11.59 1.34 11.25 1.75 11.25H3.03C3.12 10.18 3.4 9.13 3.86 8.16L2.75 7.52C2.39 7.31 2.27 6.85 2.48 6.5C2.69 6.14 3.15 6.02 3.5 6.23L4.61 6.87C5.22 5.99 5.99 5.22 6.87 4.61L6.23 3.5C6.02 3.14 6.15 2.68 6.5 2.48C6.86 2.27 7.32 2.4 7.52 2.75L8.16 3.86C9.13 3.4 10.17 3.12 11.25 3.03V1.75C11.25 1.34 11.59 1 12 1C12.41 1 12.75 1.34 12.75 1.75V3.03C13.82 3.12 14.87 3.4 15.84 3.86L16.48 2.75C16.69 2.39 17.14 2.27 17.5 2.48C17.86 2.69 17.98 3.15 17.77 3.5L17.13 4.61C18.01 5.22 18.78 5.99 19.39 6.87L20.5 6.23C20.86 6.02 21.32 6.15 21.52 6.5C21.73 6.86 21.6 7.32 21.25 7.52L20.14 8.16C20.6 9.13 20.88 10.18 20.97 11.25H22.25C22.66 11.25 23 11.59 23 12C23 12.41 22.66 12.75 22.25 12.75H20.97C20.88 13.82 20.6 14.87 20.14 15.83L21.25 16.47C21.61 16.68 21.73 17.14 21.52 17.49C21.31 17.85 20.86 17.97 20.5 17.76L19.39 17.12C18.78 18 18.01 18.77 17.13 19.38L17.77 20.49C17.98 20.85 17.85 21.31 17.5 21.51C17.14 21.72 16.68 21.59 16.48 21.24L15.84 20.13C14.87 20.59 13.82 20.87 12.75 20.96V22.24C12.75 22.65 12.41 22.99 12 22.99V23ZM12 19.5C13.32 19.5 14.61 19.15 15.75 18.5C16.89 17.84 17.84 16.89 18.5 15.75C19.03 14.83 19.36 13.81 19.46 12.75H14.9C14.57 14.04 13.39 15 11.99 15C11.72 15 11.45 14.96 11.19 14.89L8.91 18.84C9.87 19.27 10.93 19.5 11.99 19.5H12ZM5.5 15.75C6.03 16.67 6.76 17.47 7.62 18.09L9.9 14.14C9.33 13.58 9 12.81 9 12C9 11.19 9.33 10.42 9.9 9.86L7.62 5.91C6.76 6.53 6.04 7.33 5.5 8.25C4.84 9.38 4.5 10.68 4.5 12C4.5 13.32 4.85 14.62 5.5 15.75ZM11.25 13.3C11.47 13.43 11.73 13.5 12 13.5C12.83 13.5 13.5 12.83 13.5 12C13.5 11.17 12.83 10.5 12 10.5C11.74 10.5 11.48 10.57 11.25 10.7C10.79 10.97 10.5 11.47 10.5 12C10.5 12.53 10.79 13.03 11.25 13.3ZM14.91 11.25H19.47C19.36 10.19 19.04 9.17 18.51 8.25C17.85 7.11 16.9 6.16 15.77 5.5C13.72 4.31 11.09 4.19 8.94 5.16L11.22 9.11C11.48 9.04 11.75 9 12.02 9C13.42 9 14.59 9.96 14.93 11.25H14.91Z" />
  </svg>
);

export const SquareArrow: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M17.05 21H6.95C5.75 21 5.09 21 4.5 20.7C3.98 20.43 3.56 20.02 3.3 19.5C3 18.91 3 18.25 3 17.05V6.95C3 5.75 3 5.09 3.3 4.5C3.57 3.98 3.98 3.57 4.5 3.3C5.09 3 5.75 3 6.95 3H9.25C9.66 3 10 3.34 10 3.75C10 4.16 9.66 4.5 9.25 4.5H6.95C5.98 4.5 5.45 4.5 5.18 4.64C4.94 4.76 4.76 4.95 4.63 5.19C4.49 5.46 4.49 5.99 4.49 6.96V17.06C4.49 18.03 4.49 18.56 4.63 18.83C4.75 19.07 4.94 19.25 5.18 19.38C5.45 19.52 5.98 19.52 6.95 19.52H17.05C18.02 19.52 18.55 19.52 18.82 19.38C19.06 19.26 19.24 19.07 19.37 18.83C19.51 18.56 19.51 18.03 19.51 17.06V14.76C19.51 14.35 19.85 14.01 20.26 14.01C20.67 14.01 21.01 14.35 21.01 14.76V17.06C21.01 18.26 21.01 18.92 20.71 19.51C20.44 20.03 20.03 20.45 19.51 20.71C18.92 21.01 18.26 21.01 17.06 21.01L17.05 21ZM11 13.75C10.81 13.75 10.62 13.68 10.47 13.53C10.18 13.24 10.18 12.76 10.47 12.47L18.44 4.5H13.75C13.34 4.5 13 4.16 13 3.75C13 3.34 13.34 3 13.75 3H20.25C20.35 3 20.45 3.02 20.54 3.06C20.63 3.1 20.71 3.15 20.78 3.22C20.85 3.29 20.91 3.37 20.94 3.46C20.98 3.55 21 3.65 21 3.75V10.25C21 10.66 20.66 11 20.25 11C19.84 11 19.5 10.66 19.5 10.25V5.56L11.53 13.53C11.38 13.68 11.19 13.75 11 13.75Z" />
  </svg>
);

export const SquareBehindSquare: FC<SVGProps<SVGSVGElement>> = ({
  ...props
}) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M14.25 21H5.75C4.23 21 3 19.77 3 18.25V9.75C3 8.23 4.23 7 5.75 7H7V5.75C7 4.23 8.23 3 9.75 3H18.25C19.77 3 21 4.23 21 5.75V14.26C21 15.78 19.77 17.01 18.25 17.01H17V18.25C17 19.77 15.77 21 14.25 21ZM5.75 8.5C5.06 8.5 4.5 9.06 4.5 9.75V18.25C4.5 18.94 5.06 19.5 5.75 19.5H14.25C14.94 19.5 15.5 18.94 15.5 18.25V9.75C15.5 9.06 14.94 8.5 14.25 8.5H5.75ZM17 15.51H18.25C18.94 15.51 19.5 14.95 19.5 14.26V5.75C19.5 5.06 18.94 4.5 18.25 4.5H9.75C9.06 4.5 8.5 5.06 8.5 5.75V7H14.25C15.77 7 17 8.23 17 9.75V15.51Z" />
  </svg>
);

export const Translate: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M11.4925 15.4929C11.8223 15.4929 12.132 15.2731 12.2219 14.9333C12.3218 14.5335 12.082 14.1237 11.6824 14.0238C10.4134 13.694 9.37429 13.1943 8.50501 12.5247C9.74398 11.1755 10.5233 9.36654 10.903 7.07789H11.7423C12.152 7.07789 12.4917 6.73809 12.4917 6.32833C12.4917 5.91857 12.152 5.57877 11.7423 5.57877H8.24523V4.24956C8.24523 3.8398 7.90551 3.5 7.49585 3.5C7.08619 3.5 6.74647 3.8398 6.74647 4.24956V5.56878H3.24938C2.83972 5.56878 2.5 5.90858 2.5 6.31834C2.5 6.7281 2.83972 7.0679 3.24938 7.0679H4.08868C4.43839 9.30658 5.13781 11.1055 6.26687 12.4647C5.44755 13.0344 4.47836 13.4741 3.31932 13.7639C2.91965 13.8639 2.66986 14.2736 2.77977 14.6734C2.86969 15.0132 3.16944 15.2431 3.50916 15.2431C3.56911 15.2431 3.62906 15.2431 3.68901 15.2231C5.13781 14.8533 6.3468 14.2936 7.36596 13.5441C8.42508 14.4236 9.73399 15.0632 11.3127 15.4729C11.3726 15.4929 11.4426 15.4929 11.5025 15.4929H11.4925ZM5.60742 7.0679H9.37429C9.04456 8.9268 8.40509 10.3859 7.40592 11.4853C6.49668 10.3759 5.91716 8.90681 5.60742 7.0679Z" />
    <path d="M21.4343 19.4806L18.1271 10.7158C17.8673 10.0262 17.2278 9.58643 16.4884 9.58643C15.7491 9.58643 15.1096 10.0262 14.8498 10.7158L11.5426 19.4806C11.3927 19.8704 11.5925 20.3001 11.9822 20.45C12.3719 20.5999 12.8015 20.4 12.9514 20.0103L13.5908 18.3313C13.6708 18.3613 13.7607 18.3712 13.8506 18.3712H19.1562C19.2461 18.3712 19.3361 18.3513 19.416 18.3313L20.0555 20.0103C20.1654 20.3101 20.4551 20.5 20.7549 20.5C20.8448 20.5 20.9347 20.48 21.0147 20.45C21.4044 20.3001 21.5942 19.8704 21.4543 19.4806H21.4343ZM14.1304 16.8721L16.2586 11.2454C16.3585 10.9756 16.6283 10.9756 16.7282 11.2454L18.8565 16.8721H14.1404H14.1304Z" />
  </svg>
);

export const TrashShape: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M20.25 5H16.5V4.25C16.5 3.65 16.27 3.08 15.84 2.66C15.41 2.24 14.84 2 14.25 2H9.75C9.15 2 8.58 2.23 8.16 2.66C7.73 3.08 7.5 3.65 7.5 4.25V5H3.75C3.34 5 3 5.34 3 5.75C3 6.16 3.34 6.5 3.75 6.5H4.5V20C4.5 20.4 4.66 20.78 4.94 21.06C5.22 21.34 5.61 21.5 6 21.5H18C18.4 21.5 18.78 21.34 19.06 21.06C19.34 20.78 19.5 20.4 19.5 20V6.5H20.25C20.66 6.5 21 6.16 21 5.75C21 5.34 20.66 5 20.25 5ZM9 4.25C9 4.05 9.08 3.86 9.22 3.72C9.36 3.58 9.55 3.5 9.75 3.5H14.25C14.45 3.5 14.64 3.58 14.78 3.72C14.92 3.86 15 4.05 15 4.25V5H9V4.25ZM18 20H6V6.5H18V20Z" />
    <path d="M9.75 9.5C9.34 9.5 9 9.84 9 10.25V16.25C9 16.66 9.34 17 9.75 17C10.16 17 10.5 16.66 10.5 16.25V10.25C10.5 9.84 10.16 9.5 9.75 9.5Z" />
    <path d="M14.25 9.5C13.84 9.5 13.5 9.84 13.5 10.25V16.25C13.5 16.66 13.84 17 14.25 17C14.66 17 15 16.66 15 16.25V10.25C15 9.84 14.66 9.5 14.25 9.5Z" />
  </svg>
);

export const Vultisig: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      d="M2.06417 19.7173L0.5 18.1532L0.61805 18.0745L9.0193 12.4277L11.8328 14.0608L11.6558 14.1591L2.06417 19.7173Z"
      fill="url(#paint0_linear_16214_813)"
    />
    <path
      d="M2.72341 21.9997L2.15283 19.8649L2.23153 19.8157L11.9313 14.228V17.4842L11.8723 17.5138L2.72341 21.9997Z"
      fill="url(#paint1_linear_16214_813)"
    />
    <path
      d="M21.2768 21.9997L21.149 21.9406L12.0591 17.4842V14.228L21.8474 19.8551L21.2768 21.9898V21.9997Z"
      fill="url(#paint2_linear_16214_813)"
    />
    <path
      d="M21.9357 19.7173L21.857 19.6682L12.167 14.0608L14.9805 12.4277L23.4998 18.1532L21.9357 19.7173Z"
      fill="url(#paint3_linear_16214_813)"
    />
    <path
      d="M12.0688 13.8542V2.57058L14.1938 2L14.8922 12.2409L12.0688 13.8542Z"
      fill="url(#paint4_linear_16214_813)"
    />
    <path
      d="M11.8722 13.8542L9.04883 12.2409V12.1622L9.74729 2L11.882 2.57058V13.8542H11.8722Z"
      fill="url(#paint5_linear_16214_813)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_16214_813"
        x1="6.16641"
        y1="2.15736"
        x2="6.16641"
        y2="21.8226"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E6BF" />
        <stop offset="1" stopColor="#0439C7" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_16214_813"
        x1="7.04208"
        y1="2.15738"
        x2="7.04208"
        y2="21.8226"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E6BF" />
        <stop offset="1" stopColor="#0439C7" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_16214_813"
        x1="16.9582"
        y1="2.14755"
        x2="16.9582"
        y2="21.8226"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E6BF" />
        <stop offset="1" stopColor="#0439C7" />
      </linearGradient>
      <linearGradient
        id="paint3_linear_16214_813"
        x1="17.8334"
        y1="2.15736"
        x2="17.8334"
        y2="21.8226"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E6BF" />
        <stop offset="1" stopColor="#0439C7" />
      </linearGradient>
      <linearGradient
        id="paint4_linear_16214_813"
        x1="13.4756"
        y1="2.1574"
        x2="13.4756"
        y2="21.8226"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E6BF" />
        <stop offset="1" stopColor="#0439C7" />
      </linearGradient>
      <linearGradient
        id="paint5_linear_16214_813"
        x1="10.4753"
        y1="2.1574"
        x2="10.4753"
        y2="21.8226"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#33E6BF" />
        <stop offset="1" stopColor="#0439C7" />
      </linearGradient>
    </defs>
  </svg>
);

export const WarningShape: FC<SVGProps<SVGSVGElement>> = ({ ...props }) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M23.7,19.6L13.8,2.4c-.2-.3-.4-.6-.7-.7-.3-.2-.7-.3-1-.3s-.7,0-1,.3c-.3.2-.6.4-.7.7L.3,19.6C0,19.9,0,20.3,0,20.6c0,.4,0,.7.3,1,.2.3.4.6.7.7.3.2.7.3,1,.3h19.9c.4,0,.7,0,1-.3.3-.2.6-.4.7-.7.2-.3.3-.7.3-1,0-.4,0-.7-.3-1ZM12,19.9c-.7,0-1.3-.6-1.3-1.3s.6-1.3,1.3-1.3,1.3.6,1.3,1.3-.6,1.3-1.3,1.3ZM13.3,14.4c0,.6-.5,1.2-1.2,1.2h-.3c-.6,0-1.2-.5-1.2-1.2v-5.5c0-.6.5-1.2,1.2-1.2h.3c.6,0,1.2.5,1.2,1.2v5.5Z" />
  </svg>
);
