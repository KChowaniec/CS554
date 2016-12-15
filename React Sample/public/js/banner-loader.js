import React from "react";

import RactDOM from "react-dom";
// import Banners from "../../components/Banners";

class Banner extends React.Component {
    constructor(){
        super();
        this.state = {
            item : {}
        };
    }
    
    render() {
        const banner_style = {
            maxWidth: '20%',
            flexGrow : '1'
        };

        return (
            <div className="col-md-3">
            <div className="ca-hover">
                <div className="carouselImg">
                    <img  src={this.props.item.avatar} alt = {this.props.item.avatar} />
                </div>   
                <div className="carouselAvatar av4">
                </div>
                <div className="carouselContent">
                    <h3>{this.props.item.title}</h3>
                    <p>{this.props.item.movieDescription}.</p>
                </div>
                <div className="overlay"></div>
            </div>
            </div>
        )
    }
}
//<img src = {this.props.item.avatar} alt = {this.props.item.avatar} / >
class Banners extends React.Component {
    constructor(){
        super();
        this.state = {
            playlist : []
        };
    }
    changeplaylist(_playlist){
        this.setState({playlist : _playlist});
    }
    render() {
        //const playlist = [];
        
       
        return ( 
            
            <div className ="container carousel flexcontainer">
                <div className="row">
                    {this.props.playlist.map(function(item_element) {
                        return <Banner item={item_element}/>;
                    })}
                </div>
            </div>
        );
    }
}

class xBanner extends React.Component {
    constructor(){
        super();
        this.state = {
            item : {}
        };
    }
    
    render() {
        const banner_style = {
            maxWidth: '20%',
            flexGrow : '1'
        };

        return (
            <div className="col-md-3">
            <div className="ca-hover">
                <div className="carouselImg">
                    <img  src={this.props.item.avatar} alt = {this.props.item.avatar} />
                </div>   
                <div className="carouselAvatar av4">
                </div>
                <div className="carouselContent">
                    <h3>{this.props.item.movie}</h3>
                    <h3>Actor : {this.props.item.actor}</h3>
                    <h3>Director : {this.props.item.director}</h3>
                    <h3>Genre : {this.props.item.genre}</h3>
                    <h3>Year : {this.props.item.year}</h3>
                    
                </div>
                <div className="overlay"></div>
            </div>
            </div>
        )
    }
}
//<img src = {this.props.item.avatar} alt = {this.props.item.avatar} / >
class xBanners extends React.Component {
    constructor(){
        super();
        this.state = {
            movies : []
        };
    }
    changeplaylist(_movies){
        this.setState({movies : _movies});
    }
    render() {
        //const playlist = [];
        
       
        return ( 
            
            <div className ="container carousel flexcontainer">
                <div className="row">
                    {this.props.movies.map(function(item_element) {
                        return <xBanner item={item_element}/>;
                    })}
                </div>
            </div>
        );
    }
}

var user_playlist = {};

function load_playlist() {
    const _banners = document.getElementById("userplaylist");
    console.log('Hi all javascript{banner-loader} is working ' + _banners);

    var get_myPL = {
        url: "/getpl",
        method: "GET",
        contentType: "application/json"
    };

    $.ajax(get_myPL).then(function(response) {
        //console.log('User Info : ' + JSON.stringify(response));
        var data = response;
        user_playlist = data;
        RactDOM.render( <Banners playlist={data.playlistMovies}/> , _banners);
    });
}

$("#btnSearch").click(function(){
    try{
        var _url = "/searchMovies?";
        console.log('Movie : ' + $("#txtMovie").val());
        console.log('Actor : ' + $("#txtActor").val());
        
        _url += $("#txtMovie").val() ? ("movie=" + $("#txtMovie").val()) : "";
        _url += $("#txtActor").val() ? ("actor=" + $("#txtActor").val()) : "";
        _url += $("#txtDirector").val() ? ("director=" + $("#txtDirector").val()) : "";
        _url += $("#txtGenre").val() ? ("genre=" + $("#txtGenre").val()) : "";
        _url += $("#txtYear").val() ? ("year=" + $("#txtYear").val()) : "";
        console.log('Url : ' + _url );
        var search = {
            url: _url,
            method: "GET",
            contentType: "application/json"
        };
        $.ajax(search).then(function(response){
            var _movies = response;
            const _banners = document.getElementById("lstSearchResult");
            RactDOM.render( <Banners playlist={_movies}/> , _banners);
        });
    }catch(e){
        console.log(' ********************* Error *********************** ');
        console.log("error : " + e);        
        console.log('Url : ' + _url );
        console.log(' ********************* End *********************** ');
    }
    
});

load_playlist();