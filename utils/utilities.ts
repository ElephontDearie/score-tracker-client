import { NextRouter } from "next/router";

export const returnToPrevious = (router: NextRouter): void => {
    localStorage.removeItem('route');
    router.back();
  }