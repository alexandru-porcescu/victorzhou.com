// @flow
import React from 'react';
import loadable from '@loadable/component';
import { graphql } from 'gatsby';
import Helmet from 'react-helmet';
import TemplateWrapper from '../components/TemplateWrapper';
import Layout from '../components/Layout';
import Post from '../components/Post';
import Series from '../components/Series';
import NavHeader from '../components/NavHeader';
import SubscribePopup from '../components/SubscribePopup';
import FixedScrollContainer from '../components/FixedScrollContainer';

const CarbonAd = loadable(() => import('../components/CarbonAd'));

type Props = {|
  +data: Object,
  +pageContext: Object,
|};

const PostTemplate = ({ data, pageContext }: Props) => {
  const { author, title: siteTitle, subtitle: siteSubtitle, url: siteUrl } = data.site.siteMetadata;
  const { edges } = data.allMarkdownRemark;
  const { slug, prev, next } = pageContext;

  const [slugNode, prevNode, nextNode] = [slug, prev, next].map(
    s => edges.filter(e => e.node.frontmatter.slug === s)[0].node
  );

  const {
    asyncScript,
    canonical,
    category,
    date,
    dateModified,
    img: imgUrl,
    isSeries,
    isML,
    isWeb,
    title: postTitle,
    description,
    descriptionLong,
    twitterEmbed,
  } = slugNode.frontmatter;

  let wordCount = slugNode.fields.readingTime.words;
  if (data.seriesEnd) {
    wordCount += data.seriesEnd.fields.readingTime.words;
  }

  return (
    <TemplateWrapper>
      <NavHeader />
      <Layout
        title={`${postTitle} - ${siteTitle}`}
        description={descriptionLong || description || siteSubtitle}
      >
        <Helmet>
          {canonical && <link rel="canonical" href={canonical} />}
          <meta property="og:type" content="article" />
          <meta property="og:image" content={imgUrl} />
          {twitterEmbed && (
            <script async defer src="https://platform.twitter.com/widgets.js" charset="utf-8" />
          )}
          {asyncScript && <script async src={asyncScript} />}
          <script type="application/ld+json">
            {`{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "image": "${imgUrl}",
  "url": "${siteUrl + slug}",
  "headline": "${postTitle}",
  "description": "${descriptionLong || description}",
  "wordcount": "${wordCount}",
  "dateCreated": "${date}",
  "datePublished": "${date}",
  "dateModified": "${dateModified || date}",
  "inLanguage": "en-US",
  "mainEntityOfPage": "True",
  "articleBody": "${slugNode.excerpt}",
  "articleSection": "${category}",
  "author": {
    "@type": "Person",
    "name": "${author.name}",
    "url": "${siteUrl}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "${author.name}",
    "url": "${siteUrl}",
    "logo": {
      "@type": "ImageObject",
      "url": "${siteUrl}${author.photoLarge}",
      "width": "1024",
      "height": "1024"
    }
  }
}`}
          </script>
        </Helmet>
        {isSeries ? (
          <Series htmlEnd={data.seriesEnd.html} series={slugNode} seriesPosts={data.seriesPosts} />
        ) : (
          <Post post={slugNode} prevPost={prevNode} nextPost={nextNode} />
        )}
      </Layout>
      {!isSeries && <SubscribePopup postSlug={slug} isML={isML} isWeb={isWeb} />}
      <FixedScrollContainer>
        <CarbonAd largeOnly />
      </FixedScrollContainer>
    </TemplateWrapper>
  );
};

export const fragment = graphql`
  fragment PostFragment on Query {
    site {
      siteMetadata {
        author {
          name
          photoLarge
        }
        url
        subtitle
        title
      }
    }
    allMarkdownRemark(filter: { frontmatter: { slug: { in: [$slug, $prev, $next] } } }) {
      edges {
        node {
          id
          html
          excerpt(pruneLength: 5000)
          fields {
            tagSlugs
            readingTime {
              words
            }
            dateFormatted
            dateModifiedFormatted
          }
          frontmatter {
            asyncScript
            canonical
            category
            date
            description
            descriptionLong
            guestAuthor
            guestCoAuthor
            guestAuthorLink
            img
            isSeries
            isML
            isWeb
            slug
            seriesSlugs
            tags
            title
            twitterEmbed
            discussLinkTwitter
            discussLinkHN
            discussLinkReddit
          }
        }
      }
    }
    seriesEnd: markdownRemark(fields: { frontSlug: { eq: $slug } }) {
      html
      fields {
        readingTime {
          words
        }
      }
    }
    seriesPosts: allMarkdownRemark(filter: { frontmatter: { slug: { in: $seriesSlugs } } }) {
      edges {
        node {
          fields {
            dateFormatted
            dateModifiedFormatted
          }
          frontmatter {
            date
            description
            img
            slug
            title
          }
        }
      }
    }
  }
`;

export const query = graphql`
  query PostBySlug($slug: String!, $prev: String, $next: String, $seriesSlugs: [String]) {
    ...PostFragment
  }
`;

export default PostTemplate;
