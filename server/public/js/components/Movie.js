import React from 'react';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

class Movie extends React.Component {
        
    render() {
        const styles = {
          root: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
          },
          gridList: {
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
          },
          titleStyle: {
            color: 'rgb(0, 188, 212)',
          },
        };
        var recsTiles = this.props.recs.map(function(rec,i) {
            return (<GridTile
                  key={rec.id}
                  title={rec.title}
                  actionIcon={<IconButton><StarBorder color='rgb(0, 188, 212)' /></IconButton>}
                  titleStyle={styles.titleStyle}
                  titleBackground="linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
                >
                  <a href={'/movie/' + rec.id}><img src={'https://image.tmdb.org/t/p/w300_and_h450_bestv2/' + rec.poster_path} style={{width:'180px'}}/></a>
                </GridTile>);
        });
        var revs = "";
        if (this.props.reviews && this.props.reviews.length > 0)
        {
            revs = this.props.reviews.map(function (rec,i){
                return (
                    <ListItem
                      key={rec.id}
                      primaryText={rec.author}
                      secondaryText={rec.content}
                      secondaryTextLines={2}
                    />
                );
            });
        }
        var intrevs = "";
        if (this.props.intreviews && this.props.intreviews.length > 0)
        {
            intrevs = this.props.intreviews.map(function (rec,i){
                return (
                    <ListItem
                      key={rec.id}
                      primaryText={rec.author}
                      secondaryText={rec.content}
                      secondaryTextLines={2}
                    />
                );
            });
        }
        return (
                <Card style={{width:'70%',margin: '0 auto',color:'#1976d2'}}>
                    <CardHeader title={this.props.movie.title} subtitle={this.props.movie.releaseDate} titleColor="#00bcd4" titleStyle={{fontSize:'30px',fontWeight:'bold'}}/>
                    <CardText>
                        <div style={{float:'left',maxWidth:'300px'}}>

                          <img src={'https://image.tmdb.org/t/p/w300_and_h450_bestv2/' + this.props.movie.poster_path} style={{maxWidth:'300px'}}  />
                        </div>
                        <div style={{float:'left',maxWidth:'500px',marginLeft:'10px'}}>
                            <h2>Overview</h2>
                            {this.props.movie.description}
                        </div>
                        <div style={{clear:'both',paddingTop:'10px'}}>
                            <h4>If you loved {this.props.movie.title}, you would like these:</h4>
                            <div style={styles.root}>
                                <GridList style={styles.gridList} cols={2.2}>
                                    {recsTiles}
                                </GridList>
                            </div>
                            <List>
                                {intrevs != "" &&
                                <h3>Internal Reviews</h3>
                                }
                                {intrevs}
                            </List>
                            <List>
                                {revs != "" &&
                                <h3>Movie Reviews From MovieDB.com</h3>
                                }
                                {revs}
                            </List>
                        </div>
                    </CardText>
              </Card>
            );
    }

}
export default Movie;