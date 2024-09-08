import { Request } from "express-serve-static-core";
import { AppParams, QueryUserParams } from "../models/params";

const getLink = (req: Request<AppParams, {}, {}, QueryUserParams>, info?: "previous" | "next"): string => {
  const { path, hostname, query, protocol, baseUrl } = req;

  const currentPage = parseInt(query.page as string) || 1;

  const getNewPage = (page: number, info?: "previous" | "next"): number => {
    if (info === "next") return page + 1;
    if (info === "previous") return page - 1;
    return page;
  };

  const newPage = getNewPage(currentPage, info);
  const newQuery = { ...query, page: newPage };

  const serialize = (query: Record<string, string | number>): string => {
    return Object.entries(query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
  };

  const newUrl = (url: string): string => {
    return url === "/" ? "" : url;
  };

  return `${protocol}://${hostname}:${process.env.PORT}${newUrl(baseUrl)}${newUrl(path)}?${serialize(newQuery)}`;
};

export default getLink;
