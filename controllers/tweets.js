const { response } = require('express');
const Tweet = require('../models/post');
const Data = require('../models/data');
const User = require('../models/user');

const getTweets = async(req, res = response ) => {

    const uid = req.uid;
    const findDataModel = await Data.find({ "userId": uid });
    const dataModelTweets = findDataModel[0].all;

    // const { getTweets } = req.body;

    const tweets = await Tweet.find({
        "_id" : {
          "$in" : 
          dataModelTweets
         }
      })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName username img followers followings imgPort');

    // const misTweets = await Tweet.find({"userId": userId }).sort({ createdAt: -1 })
    //                                     .populate('userId', 'firstName username');
    
    res.json({
        ok: true,
        tweets,
        tweets: tweets.option1,
        dataModelTweets
    });
}

const getFollowingTweets = async( req, res = response) => {

    const uid =  req.uid;
    const { users } = req.body;
    
    if ( !users ) {
        return res.status(500).json({
            mag:'No hay usuarios en el body de la peticion'
        })
    }

    const tweets = await Tweet.find({
      "userId" : {
        "$in" : 
          users
       }
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName username img followers followings imgPort')
    
    // .skip( 0 )
    // .limit( 6  )

    // TODO: hacer esta funcion en el frontend

    // tweets.forEach( e => {
    //     if (e.likes.includes( uid ) === true ) {
    //         e.liked = true;
    //         return tweets;
    //     } 
    // })
    
    res.status(200).json({
        msg:'oko',
        tweets
    })
}

const getData = async( req, res = response ) => {

    try {
        
        const userDB = await User.find({ "username": req.params.id });
        
        const tipo = req.params.tipo;
        const user = userDB[0];
        const uid = userDB[0]._id;
    
    let data = [];
    let users = [];

        switch (tipo) {

            case 'tweets':

                const findDataModel = await Data.find({ "userId": uid });
                const dataModelTweets = findDataModel[0].all;                
                
                data = await Tweet.find({
                        "_id" : {
                        "$in" : 
                        dataModelTweets
                        }
                    })
                    .populate('userId', 'firstName lastName username img followers followings imgPort');
                
                
                data.reverse();
                
            break;

            case 'likes':

                data = await Tweet.find({ "likes": uid })
                                   .populate( 'userId', 'firstName username email img' );

                data.forEach( e => {
                    if ( e.likes.includes( uid ) === true ) {
                        e.liked = true;
                        return data;
                    }
                }) 

            break;

            case 'with_replies':

                data = 'tweets con respuestas';

            break;

            case 'media':

                data = 'tweets con imagenes';

            break;

            case 'followings':

                if ( !userDB ) {
                    return res.status(404).json({
                        ok: false,
                        msg:'No hay usuario en la peticion'
                    })
                }
            
                try {
                
                    const user = await User.findById( uid );

                    users = await User.find({ '_id': {
                        '$in': user.followings
                      }});
                                                              

                } catch (error) {
                    res.status(404).json({
                        ok: false,
                        msg:'Error en la peticion'
                    })
                }

            break;

            case 'followers':

                if ( !userDB ) {
                    return res.status(404).json({
                        ok: false,
                        msg:'No hay usuario en la peticion'
                    })
                }
            
                try {
                
                    const user = await User.findById( uid );

                    users = await User.find({ '_id': {
                        '$in': user.followers
                      }});
                                                              

                } catch (error) {
                    res.status(404).json({
                        ok: false,
                        msg:'Error en la peticion'
                    })
                }

            break;
        
            default:
                return res.status(400).json({
                    ok: false,
                    msg: 'La tabla tiene que ser likes/ replies/ tweets/ media'
                });
        }

        res.json({
            ok:true,
            resultado: data,
            users,
            user
        });

    } catch (error) {
        
        return res.status(404).json({
            ok: false,
            msg:'No hay usuario'
        })
    }

}

const getBookmark = async( req, res = response ) => {

    try {
         
        const uid = req.uid;
        const data = await Data.find({ "userId": uid });
        
        const bookmarksArr = data[0].bookmark;

        const bookmarks = await Tweet.find({
            "_id" : {
            "$in" : 
            bookmarksArr
            }
        })
        .populate('userId', 'firstName lastName username img followers followings imgPort');


        return res.json({
            ok: true,            
            bookmarks: bookmarks
        })


    } catch (error) {
        
        return res.status(404).json({
            ok: false,
            msg:'Error bookmark'
        })
    }

}

const addBookmark = async(req, res = response ) => {

    try {
        
        const uid = req.uid;
        const id = req.params.id;
        const getData = await Data.find({ "userId": uid });
        const addData = getData[0];

        const tweet = await Tweet.findById( id );

        if( !tweet ){
            return res.json({
                ok: false,
                msg:'Tweet does not exist'
            })
        }

        if ( addData.bookmark.includes( id ) ) {

            const find = addData.bookmark.indexOf( id );
            addData.bookmark.splice( find, 1 );

            var message = 'Tweet removed from your Bookmarks'
            
        } else {
            
            addData.bookmark.push( tweet );
            var message = 'Tweet added to your Bookmarks';

        }

        await Data.findByIdAndUpdate( addData._id, addData, { new: true } );

        res.json({
            ok:true,
            msg: message
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg:'Error, hable con el administrador - crear tweet',
            uid
        })
    }

}

const createTweet = async(req, res = response ) => {

    
    try {
        
        const uid = req.uid;

        const getData = await Data.find({ "userId": uid });
        const addData = getData[0];

        const tweet = new Tweet({ userId:uid, ...req.body });
        const tweetDB = await tweet.save();

        const tweet2 = await Tweet.findById( tweetDB._id )
                                  .populate('userId', 'username img firstName createdAt');

        addData.all.push( tweetDB );

        await Data.findByIdAndUpdate( addData._id, addData, { new: true } );

        res.json({
            ok:true,
            tweet: tweet2
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg:'Error, hable con el administrador - crear tweet',
            uid
        })
    }

}

// TODO: el tweet respuesta debe postear imagenes y demas caracteristicas

const createReply = async(req, res = response ) => {

    const uid = req.uid;
    const { message, id } = req.body;

    const originalTweet = await Tweet.findById( id );

    if (!originalTweet ) {
        return res.status(404).json({
            ok: false,
            msg:'No es un id de tweet valido'
        })
    }

    const tweet = new Tweet({ userId:uid, message });

    try {

        const tweetDB = await tweet.save();
        const { _id } = tweetDB;
        
        if ( tweetDB ) {

            originalTweet.replies.push( _id );
            
            const usernameTweet = await User.findById( originalTweet.userId );
        
            tweetDB.replyTo = usernameTweet.username;
            tweetDB.reply = true

            await Tweet.findByIdAndUpdate( _id, tweetDB, { new: true})            
            
            const tweetOriginalUpdated = await Tweet.findByIdAndUpdate( originalTweet._id , originalTweet, { new: true })
            
            const reply = await Tweet.findById( tweetDB._id )
                                         .populate('userId', 'username img firstName createdAt');


            res.json({
                ok:true,
                tweet: reply,
                tweetOriginalUpdated: tweetOriginalUpdated 
            });

        }

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg:'Error, hable con el administrador - crear tweet',
            uid
        })
    }

}

const retweet = async( req, res ) => {

    const id = req.params.id;
    const uid = req.uid;

    const getData = await Data.find({ "userId": uid });
    const addData = getData[0]; 
    const retweeted = await Tweet.findById( id );

    if ( !retweeted ) {
        return res.status(404).json({
            ok: false,
            mag: 'No se encontro tweet'
        })
    }

    try {

        if ( addData.all.includes( retweeted._id ) ) {

            const del = addData.all.indexOf( retweeted._id );
            addData.all.splice( del, 1 );

            const deleteRetweet = retweeted.retweets.indexOf( uid );
            retweeted.retweets.splice( deleteRetweet, 1 );
            
        } else {
            
            addData.all.push( retweeted );
            retweeted.retweets.push( uid );

        }

        const dataUpdated = await Data.findByIdAndUpdate( addData._id, addData, { new: true } );
        const tweetUpdated = await Tweet.findByIdAndUpdate( retweeted._id, retweeted, { new: true } )
        
        res.json({
            ok: true,
            dataUpdated,
            tweetUpdated
        })
        
    } catch (error) {
        res.json({
            ok: false,
            msg: error
        })
    }

}

// LIKE TWEET

const updateTweet = async(req, res) => {

    const { id } = req.body;
    const uid = req.uid;
    let liked; 

    if (!uid) {
        return res.json({
            msg:'No hay nada'
        })
    }
    
    try {
        
        const tweet = await Tweet.findById( id );
        const likes = tweet.likes;

        if( !tweet ){

            return res.status(404).json({
                ok:true,
                msg:'Post no encontrado'
            });
            
        }

        if( likes.includes( uid ) === false ){
            tweet.likes.push( uid );
            liked = true;
        } else{
            const find = tweet.likes.indexOf( uid );
            tweet.likes.splice( find, 1 )
            liked = false;
        }

        const tweetUpdated = await Tweet.findByIdAndUpdate( id, tweet, { new: true });

        res.json({
            ok:true,
            liked,
            tweet: tweetUpdated
        });
        
    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador - update tweet'
        })
        
    }

    
}

const updatePoll = async(req, res) => {

    const { id } = req.body;
    const { userVote } = req.body;
    const { option } = req.body;

    const tweetDB = await Tweet.findById( id );

    if ( tweetDB.option1.userVotes.includes( userVote ) || tweetDB.option2.userVotes.includes( userVote ) ) {
        return res.json({
            ok: false,
            msg:'you cant vote 2 times'
        })
    }

    if ( userVote === tweetDB.userId._id ) {
        return res.json({
            ok: false,
            mag:'You cant try this, because is your own poll'
        })
    }

    try {
        
        if (option === 'option1') {
            
            const tweet = await Tweet.findByIdAndUpdate({ _id: id },
                                                { $inc: {
                                                    "option1.vote" : 1
                                                }}, { new: true });

            tweet.option1.userVotes.push( userVote );
            
            await Tweet.findByIdAndUpdate( tweet._id, tweet, { new: true });

            res.json({
                ok:true,
                tweet
            });

        } else {

            const tweet = await Tweet.findByIdAndUpdate({ _id: id }, 
                                                { $inc: {
                                                    "option2.vote" : 1
                                                }}, { new: true });
            
            tweet.option2.userVotes.push( userVote );
            await Tweet.findByIdAndUpdate( tweet._id, tweet, { new: true });

            res.json({
                ok:true,
                tweet
            });

        }
        
    } catch (error) {

        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador - update tweet'
        })
        
    }

    
}


const deleteTweet = async(req, res) => {
    
    const id = req.params.id;
    const uid = req.uid;

        try {

            const tweet = await Tweet.findById( id );

            if( !tweet ){

                return res.status(404).json({
                    ok:true,
                    msg:'Tweet no encontrado'
                });

            } else if( tweet.userId._id != uid ){
                return res.status(401).json({
                    msg:'No tienes permitido hacer esto',
                    tweet: tweet.userId._id,
                    uid
                })
            }

            if ( tweet.reply === true ) {
                
                const replyDelete = await Tweet.find({ "replies": { "$in": id } } );
                const reply = replyDelete[0];
                
                if ( reply.replies.includes( id ) ) {
                    
                    const deleteReply = reply.replies.indexOf( id );
                    reply.replies.splice( deleteReply, 1 );
                    
                    const reply2 = await Tweet.findByIdAndUpdate( reply._id, reply, { new: true } );
                
                    await Tweet.findByIdAndDelete(id);
                
                    return res.json({
                        mag:'tweet y rspuesta eliminados',
                        reply2
                    })
                
                }
            
            

            } else {

                await Tweet.findByIdAndDelete(id);
                const deleteFromData = await Data.find({ "userId": uid })                
                const dataModelTweets = deleteFromData[0].all;
                const dataModel = deleteFromData[0];                    
                const dataId = deleteFromData[0]._id;

                if ( dataModelTweets.includes( id ) ) {
                    const del = dataModelTweets.indexOf( id );
                    dataModelTweets.splice( del, 1);
                              
                    await Data.findByIdAndUpdate( dataId, dataModel, { new: true } )
                }

                return res.json({
                    msg:'El tweet ha sido eliminado'
                })

            }

        } catch (error) {

            return res.json({
                ok:false,
                msg:'Error de server'
            });


        }

        
}

const getTweetById = async(req, res = response ) => {

    const idt = req.params.idt;
    const uid = req.uid;
    
    try {

    const tweet = await Tweet.findById( idt )
                                .populate('userId', 'username img firstName createdAt');

    if (tweet.likes.includes( uid )) {
        tweet.liked = true;        
    }

    res.json({ 
        ok:true,
        tweet
    });
        
    } catch (error) {
        res.json({
            ok:false,
            msg: 'Hable con el administrador'
        })
    }

    
}

const getReplies = async( req, res = response) => {

    const uid =  req.uid;
    const { getReplies } = req.body;
    
    if ( !getReplies ) {
        return res.status(500).json({
            mag:'No hay nada en el body de la peticion'
        })
    }

    // const tweets = await Tweet.findById( users )

    const tweets = await Tweet.find({
      "_id" : {
        "$in" : 
        getReplies
       }
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName username img followers followings imgPort');

    tweets.forEach( e => {
        if (e.likes.includes( uid ) === true ) {
            e.liked  = true;
            return tweets;
        } 
    })
    
    res.status(200).json({
        msg:'ok',
        tweets
    })
}


module.exports = {
    getTweets,
    getFollowingTweets,
    getData,
    getBookmark,
    addBookmark,
    createTweet,
    retweet,
    createReply,
    updateTweet,
    updatePoll,
    deleteTweet,
    getTweetById,
    getReplies
}


        