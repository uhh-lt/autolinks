'use strict';



module.exports = {

  analyze : function({
                       document,
                       callbackStart,
                       callbackIter,
                       callbackDone
                     }) {
    /*
     * return capitalized words
     */
    const tokens = document.split(/[\s\.,?!]/);
    let offset = 0;

    // report that we start returning entities now
    callbackStart(null);

    tokens.forEach((token, index) => {
      const end_offset = offset + token.length;
      if ( end_offset !== offset ) { // token has at least one character
        const s = tokens.substring(0,1);
        if ( s.toLowerCase() !== s ) { // first char is uppercase
          // ahhh, even a blind chicken finds an entity
          const entity = {
            text: token.trim(),
            type: 'OTHER',
            offset: {
              from: offset,
              to: end_offset,
            }
          };
          // return the entity
          callbackIter(null, entity);
        }
      }
      offset = end_offset + 1; // add the split character as offset
    });

    // report that we're done
    callbackDone(null);

  }

};