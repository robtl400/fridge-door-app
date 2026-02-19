import { useEffect } from "react";

export function useOutsideClick(refs, onOutsideClick) {
  useEffect(() => {
    const handleClick = (e) => {
      const isOutside = refs.every(
        (ref) => !ref.current || !ref.current.contains(e.target)
      );
      if (isOutside) onOutsideClick();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [refs, onOutsideClick]);
}
