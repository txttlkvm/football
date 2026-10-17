export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const PostPartsFragmentDoc = gql`
    fragment PostParts on Post {
  __typename
  livePreview
  title
  body
  draft
  date
  categories
  image
  imageFocus
  excerpt
  publishDate
  description
  featured
}
    `;
export const PagePartsFragmentDoc = gql`
    fragment PageParts on Page {
  __typename
  livePreview
  title
  layout
  image
  body
  showRegisterCta
  description
  draft
  blocks {
    __typename
    ... on PageBlocksHero {
      image
      focus
      heading
      text
      buttonLabel
      buttonUrl
      button2Label
      button2Url
      height
    }
    ... on PageBlocksText {
      heading
      text
      align
      width
      background
    }
    ... on PageBlocksImageText {
      image
      focus
      ratio
      alt
      heading
      text
      buttonLabel
      buttonUrl
      imageSide
      background
    }
    ... on PageBlocksGallery {
      title
      perRow
      images {
        __typename
        src
        focus
        alt
        caption
      }
      ratio
      background
    }
    ... on PageBlocksFeature {
      image
      focus
      ratio
      eyebrow
      heading
      text
      buttonLabel
      buttonUrl
      linkLabel
      linkUrl
      background
    }
    ... on PageBlocksCta {
      heading
      text
      buttonLabel
      buttonUrl
      style
    }
    ... on PageBlocksVideo {
      url
      file
      caption
      background
    }
    ... on PageBlocksQuote {
      text
      author
      background
    }
    ... on PageBlocksPostGrid {
      title
      count
      category
      background
    }
    ... on PageBlocksFeaturedPost {
      title
      background
    }
    ... on PageBlocksCategoryTiles {
      title
      tiles {
        __typename
        label
        slug
        image
      }
      background
    }
    ... on PageBlocksFaq {
      title
      questions {
        __typename
        question
        answer
      }
      background
    }
    ... on PageBlocksColumns {
      title
      points {
        __typename
        icon
        heading
        text
      }
      background
    }
    ... on PageBlocksForm {
      title
      intro
      buttonLabel
      successText
      background
    }
    ... on PageBlocksSpacer {
      size
    }
  }
}
    `;
export const HomePartsFragmentDoc = gql`
    fragment HomeParts on Home {
  __typename
  livePreview
  blocks {
    __typename
    ... on HomeBlocksHero {
      image
      focus
      heading
      text
      buttonLabel
      buttonUrl
      button2Label
      button2Url
      height
    }
    ... on HomeBlocksText {
      heading
      text
      align
      width
      background
    }
    ... on HomeBlocksImageText {
      image
      focus
      ratio
      alt
      heading
      text
      buttonLabel
      buttonUrl
      imageSide
      background
    }
    ... on HomeBlocksGallery {
      title
      perRow
      images {
        __typename
        src
        focus
        alt
        caption
      }
      ratio
      background
    }
    ... on HomeBlocksFeature {
      image
      focus
      ratio
      eyebrow
      heading
      text
      buttonLabel
      buttonUrl
      linkLabel
      linkUrl
      background
    }
    ... on HomeBlocksCta {
      heading
      text
      buttonLabel
      buttonUrl
      style
    }
    ... on HomeBlocksVideo {
      url
      file
      caption
      background
    }
    ... on HomeBlocksQuote {
      text
      author
      background
    }
    ... on HomeBlocksPostGrid {
      title
      count
      category
      background
    }
    ... on HomeBlocksFeaturedPost {
      title
      background
    }
    ... on HomeBlocksCategoryTiles {
      title
      tiles {
        __typename
        label
        slug
        image
      }
      background
    }
    ... on HomeBlocksFaq {
      title
      questions {
        __typename
        question
        answer
      }
      background
    }
    ... on HomeBlocksColumns {
      title
      points {
        __typename
        icon
        heading
        text
      }
      background
    }
    ... on HomeBlocksForm {
      title
      intro
      buttonLabel
      successText
      background
    }
    ... on HomeBlocksSpacer {
      size
    }
  }
  title
  layout
  description
}
    `;
export const SettingsPartsFragmentDoc = gql`
    fragment SettingsParts on Settings {
  __typename
  livePreview
  siteTitle
  logo
  tagline
  theme {
    __typename
    accent
    dark
    text
    soft
    headingFont
    bodyFont
  }
  nav {
    __typename
    label
    href
    children {
      __typename
      label
      href
    }
  }
  registerUrl
  announcement {
    __typename
    show
    text
    linkText
    linkUrl
  }
  classCard {
    __typename
    label
    text
    buttonText
    stickyText
  }
  mobileCta
  formsKey
  footerText
  social {
    __typename
    label
    url
  }
}
    `;
export const PostDocument = gql`
    query post($relativePath: String!) {
  post(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PostParts
  }
}
    ${PostPartsFragmentDoc}`;
export const PostConnectionDocument = gql`
    query postConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PostFilter) {
  postConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PostParts
      }
    }
  }
}
    ${PostPartsFragmentDoc}`;
export const PageDocument = gql`
    query page($relativePath: String!) {
  page(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PageParts
  }
}
    ${PagePartsFragmentDoc}`;
export const PageConnectionDocument = gql`
    query pageConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PageFilter) {
  pageConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PageParts
      }
    }
  }
}
    ${PagePartsFragmentDoc}`;
export const HomeDocument = gql`
    query home($relativePath: String!) {
  home(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...HomeParts
  }
}
    ${HomePartsFragmentDoc}`;
export const HomeConnectionDocument = gql`
    query homeConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: HomeFilter) {
  homeConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...HomeParts
      }
    }
  }
}
    ${HomePartsFragmentDoc}`;
export const SettingsDocument = gql`
    query settings($relativePath: String!) {
  settings(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SettingsParts
  }
}
    ${SettingsPartsFragmentDoc}`;
export const SettingsConnectionDocument = gql`
    query settingsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SettingsFilter) {
  settingsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SettingsParts
      }
    }
  }
}
    ${SettingsPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    post(variables, options) {
      return requester(PostDocument, variables, options);
    },
    postConnection(variables, options) {
      return requester(PostConnectionDocument, variables, options);
    },
    page(variables, options) {
      return requester(PageDocument, variables, options);
    },
    pageConnection(variables, options) {
      return requester(PageConnectionDocument, variables, options);
    },
    home(variables, options) {
      return requester(HomeDocument, variables, options);
    },
    homeConnection(variables, options) {
      return requester(HomeConnectionDocument, variables, options);
    },
    settings(variables, options) {
      return requester(SettingsDocument, variables, options);
    },
    settingsConnection(variables, options) {
      return requester(SettingsConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4102/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
