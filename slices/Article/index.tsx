import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import { ArticleFeature } from "./variations/article-feature";
import { ArticleList } from "./variations/article-list";

export type ArticleProps = SliceComponentProps<Content.ArticleSlice>;

export default function Article(props: ArticleProps) {
  switch (props.slice.variation) {
    case "feature":
      return <ArticleFeature {...props} slice={props.slice} />;
    case "list":
      return <ArticleList {...props} slice={props.slice} />;
  }
}
