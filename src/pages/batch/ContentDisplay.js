import React, { useEffect, useState } from 'react';
import './ContentDisplay.css';

const ContentDisplay = ({ content , title='' }) => {
    const [renderedContent, setRenderedContent] = useState(null);

    useEffect(() => {
        const renderContent = () => {
            if (!content) {
                return <p className="text-content">No content available</p>;
            }
            const fileExtension = content.split('.').pop().toLowerCase();
            switch (true) {
                case fileExtension === 'txt':
                    return <p className="text-content">{content}</p>;
                case fileExtension === 'mp3':
                case fileExtension === 'wav':
                case title && title.indexOf('音频') === 0:
                case title && title.indexOf('配音') === 0:
                case fileExtension === 'ogg':
                    return <audio className="audio-content" controls>
                        <source src={content} type={`audio/${fileExtension}`} />
                        Your browser does not support the audio element.
                    </audio>;
                case fileExtension === 'jpg':
                case fileExtension === 'jpeg':
                case fileExtension === 'png':
                case title && title.indexOf('图片') === 0:
                case fileExtension === 'gif':
                    return <img className="image-content" src={content} alt="content" />;
                case fileExtension === 'mp4':
                case fileExtension === 'webm':
                case title && title.indexOf('视频') === 0:
                case fileExtension === 'ogg':
                    return <video className="video-content" controls style={{ maxWidth: "350px" }}>
                        <source src={content} type={`video/${fileExtension}`} />
                        Your browser does not support the video tag.
                    </video>;
                default:
                    return <p className="text-content">{content}</p>;
            }
        };

        setRenderedContent(renderContent());
    }, [content, title]);

    return (
        <div className="content-container">
            {renderedContent}
        </div>
    );
};

export default ContentDisplay;
