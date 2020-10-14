import React from 'react'

import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
  EmailIcon,
  FacebookIcon,
  TwitterIcon,
} from 'react-share';


type Props={
    startStation: string | undefined,
    endStation: string | undefined,
    line: string | undefined
}
export const ShareButtons = ({startStation,endStation,line}: Props)=>{
    const prompt = `Checkout this graph of overcrowding on the ${line} line between ${startStation} and ${endStation}`
    const hashtag = `#mtaaccessibility` // Facebook share only allows one hashtag
    const hashtagList = ['newyorktough', 'covid19', 'mta', 'mtaaccessibility', 'accessibility', 'dataforgood', 'opendata']
    return(
      <>
            <FacebookShareButton style={{marginBottom:"0px"}} quote={prompt} url={window.location.href} hashtag={hashtag} >
              <FacebookIcon size={20} />
            </FacebookShareButton>{' '}
            <TwitterShareButton title={prompt} url={window.location.href}  hashtags={hashtagList}>
              <TwitterIcon size={20} />
            </TwitterShareButton>{' '}
            <EmailShareButton 
              subject={prompt}
              body={prompt}
              url={window.location.href}>
              <EmailIcon size={20} />
            </EmailShareButton>
            </>
    )
}