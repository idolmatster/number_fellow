
const { API, } = require('nhentai-api');

const api = new API();

class doujin {
    constructor(link, title, id, tags, translated, artist, character, parody, language, title_link, page_count,) {
        this.link = link;
        this.title = title;
        this.id = id;
        this.tags = tags;
        this.translated = translated;
        this.artist = artist;
        this.character = character;
        this.parody = parody;
        this.language = language;
        this.title_link = title_link;
        this.page_count = page_count;
    }

}

async function exists(id) {
    api.getBook().
        catch(function (error) {
            return false;
        });
    return true;
}

async function getDoujin(id) {

    let book = await api.getBook(id);

    let link = `https://nhentai.net/g/${id}/`

    let title = await book.title.pretty;

    let sorted_tags = tags_Sorter(book.tags);

    let tags = sorted_tags[0];
    let languages = sorted_tags[1];
    let parody = sorted_tags[2];
    let character = sorted_tags[3];
    let artist = sorted_tags[4];

    let translated = false;

    if (languages.length > 1) {
        translated = true;
    }
    let language = await language_analyser(languages);

    let title_link = api.getImageURL(book.cover);

    let page_count = await book.pages.length;

    return new doujin(link, title, id, tags, translated, artist, character, parody, language, title_link, page_count);
}


function tags_Sorter(unsorted_tags) {
    let tag = [];
    let language = [];
    let parody = [];
    let character = [];
    let artist = [];
    let sorted_tags = [];

    unsorted_tags.forEach(element => {
        if (element.url.includes('/tag/')) {
            tag.push(element.name);
        } else if (element.url.includes('/language/')) {
            language.push(element.name);
        } else if (element.url.includes('/parody/')) {
            parody.push(element.name);
        } else if (element.url.includes('/character/')) {
            character.push(element.name);
        } else if (element.url.includes('/artist/')) {
            artist.push(element.name);
        }
    });

    sorted_tags.push(tag);
    sorted_tags.push(language);
    sorted_tags.push(parody);
    sorted_tags.push(character);
    sorted_tags.push(artist);

    return sorted_tags;
}

async function language_analyser(languages) {
    let language;
    languages.forEach(element => {
        switch (languages.length) {
            case 1:
                return language = element;
            case 2:
                if (element !== 'translated') {
                    return language = element;
                } else {
                    break;
                }
            case 3:
                if (element !== 'japanese' && element !== 'translated') {
                    return language = element;
                } else {
                    break
                }
            default:
                return language = '';
        }
    });
    return language
}

module.exports.getDoujin = getDoujin;
module.exports.exists = exists;
