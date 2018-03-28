const
    Ctakes = require('../../controller/nlp-components/CtakesNLP');


Ctakes.analyze("tim is a nice guy and is happy", "raw text", "sometext.txt", function(error, analysis) {
    if(error != null) {
        console.log(error);
        return;
    }

    console.log('finished analysis!');
    console.log(analysis.annotations);
    console.log(analysis.annotations[10].properties);
});