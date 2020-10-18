const sortModes = [
    { likes: 1 },
    { likes: -1 },
    { datePublished: 1 },
    { datePublished: -1 },
];

const getSortMode = (num) => {
    try {
        return sortModes[num];
    } catch (err) {
        return sortModes[0];
    }
};

const getRegEx = (text) => new RegExp(text, 'i');

const createOrGroup = (word)=>{
    reWord = getRegEx(word);
    let orGroup = [];
    orGroup.push({ title: reWord });
    orGroup.push({ description: reWord });
    orGroup.push({ tags: reWord });
    return orGroup
}

const getCriteria = (searchWords) => {
    let andGroup = [];
    try {
        if (typeof searchWords == 'string'){
            const orGroup = createOrGroup(searchWords)
            return { $or: orGroup }
        } else{
            searchWords.forEach((word) => {
                const orGroup = createOrGroup(word)
                andGroup.push({ $or: orGroup });
            });
            return { $and: andGroup };
        }
    } catch (err) {
        return {};
    }
};

module.exports.getSortMode = getSortMode;
module.exports.getCriteria = getCriteria;
