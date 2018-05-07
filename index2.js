'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('0e7c2f5cd99b4024b190c095e0d63b10');
const server = express();

server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(bodyParser.json());

server.get('/news', function (req, res) {
    const query = req.query.query;
    newsapi.v2.topHeadlines({
        q: query || 'chatbots',
        sources: 'vice-news',
    }).then(response => {
        let responseToSend;
        if (response.status === 'ok' && response.articles.length > 0) {
            const articles = response.articles.map(article => {
                return {
                    "title": article.title,
                    "image_url": article.urlToImage,
                    "subtitle": article.description,
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": article.url,
                            "title": "Read Full Article"
                        }
                    ]
                }
            })
            responseToSend = {
                "messages": [
                    {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "image_aspect_ratio": "square",
                                "elements": articles.slice(0, 10)
                            }
                        }
                    }
                ]
            };
            return res.json(responseToSend);
        } else {
            responseToSend = {
                "messages": [
                    { "text": `Postcoital bliss or a zombie apocalypse: it's quiet in DC.` },
                    { "text": "Feel free to check back later, but run if you see any zombies." }
                ]
            }
            return res.json(responseToSend);
        }
    }, (error) => {
        responseToSend = {
            "messages": [
                { "text": `Opps! Something went wrong while searching for articles on ${query}.` },
                { "text": `Got this error: ${error}` }
            ]
        }
        return res.json(error);
    });
});

server.listen((process.env.PORT || 8000), function () {
    console.log("Server is up and running...");
});
