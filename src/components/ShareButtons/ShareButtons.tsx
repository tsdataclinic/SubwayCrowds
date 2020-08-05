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
    startStation: string,
    endStation: string,
    line: string
}
export const ShareButtons = ({startStation,endStation,line}: Props)=>{
    const prompt = `Checkout this graph of overcrowding on the ${line} line between ${startStation} and ${endStation}`
    const hashtag = `#mtaaccessibility` // Facebook share only allows one hashtag
    const hashtagList = ['newyorktough', 'covid19', 'mta', 'mtaaccessibility', 'accessibility', 'dataforgood', 'opendata']
    return(
        <div className="share-icons">
            <FacebookShareButton quote={prompt} url={window.location.href} hashtag={hashtag} >
              <FacebookIcon size={36} />
            </FacebookShareButton>{' '}
            <TwitterShareButton title={prompt} url={window.location.href}  hashtags={hashtagList}>
              <TwitterIcon size={36} />
            </TwitterShareButton>{' '}
            <EmailShareButton 
              subject={prompt}
              body={prompt}
              url={window.location.href}>
              <EmailIcon size={36} />
            </EmailShareButton>
        </div>
    )
}