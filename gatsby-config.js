module.exports = {
  trailingSlash: "never",
  siteMetadata: {
    title: `BRAINSTELLAR`,
    description: `Puzzles from Quant Interviews`,
    author: `varun-seth`,
    siteUrl: `https://brainstellar.com`,
  },
  plugins: [
    // `gatsby-plugin-mdx`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-katex`,
          `gatsby-remark-prismjs`,
          // ... other plugins
          {
            resolve: 'gatsby-remark-copy-linked-files',
            options: {
              // Default ignores png/jpg/etc, expecting gatsby-remark-images
              // to handle those -- now that plugin is gone, this is the only
              // thing that copies question images into public/ and rewrites
              // their src, so it needs to handle every extension in use.
              ignoreFileExtensions: [],
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `questions`,
        path: `${__dirname}/src/data/questions`,
      },
    },
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `BRAINSTELLAR`,
        short_name: `BRAINSTELLAR`,
        start_url: `/`,
        background_color: `#a8323c`,
        theme_color: `#993333`,
        display: `standalone`,
        icon: `static/logo.png`,
        include_favicon: false,
      },
    },
  ],
}
