import React from 'react'
import { Helmet } from 'react-helmet'

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />
    </Helmet>
  )
}

Meta.defaultProps = {
  title: 'TECH PHONE - Điện thoại chính hãng',
  description: 'Mua iPhone, Samsung và phụ kiện công nghệ chính hãng',
  keywords: 'iphone, samsung, điện thoại, phụ kiện, tech phone',
}

export default Meta
