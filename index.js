/**
 * Node.js interface to the ChatAPI engine.
 * You need a legit ChatAPI user account and API key to run this; and
 * place your key in the .env file
 * Usage:
 * node index.js
 */

// include the openAi library
const { Configuration, OpenAIApi } = require("openai");

// reads the .env file, which puts the contents of the
// .env file (which includes the API key) into process.env
require('dotenv').config()

let DEBUG = false;

// set up a config object/w the openAI key
const configuration = new Configuration({
    // remember, we got process.env.XXX from the
    // reading of the .env file
    apiKey: process.env.OPENAI_API_KEY,
  });

/**
 * low level method to read stdin
*/
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
/**
 * mid-level method to help read stdin
 * @param {*} prompt 
 * @param {*} defaultVal 
 * @returns 
 */  
  async function readinput(prompt, defaultVal) {
    return new Promise((resolve, reject) => {
      if( defaultVal && defaultVal.length>0) { 
        prompt = (`${prompt} ->${defaultVal}`);
      }
      readline.question(prompt, answer => {
        if(DEBUG)console.log(`DEBUG you entered: [${answer}]`);
        //readline.close();
        resolve (answer);
      });
    });
  }

  /**
   * Get input question from user on command line
   * @returns Promise
   * Usage example:
   * 
   * let usersQuestion = await getQuestion()
   */
  async function getQuestion() {
    let defaultQ = 'What is the age of the Earth?'
    let prompt = `\nEnter a question for chatGPI (or q to quit):\n-> [${defaultQ}]`;
      
      let userQ ;
        goodQ = false;
        while( !goodQ ) { 
          userQ = await readinput(prompt,null);
          if(userQ.toLowerCase() == 'q') {
            process.exit(1);
          }
          if( userQ == '') {
            userQ = defaultQ;
          }
          if( userQ.length != 0){ 
            goodQ = true;
          }
        }
      if(DEBUG)console.log(`DEBUG Your question: [${userQ}]`);
      return userQ;
  }

// the openAi server  
let openai = null;

/**
 * Set up openAi server
 */
function configure() { 
    try { 
      console.log('Configuring OpenAIApi ...')
      openai = new OpenAIApi(configuration);
      console.log('... successfully configured OpenAIApi')
      if( openai == null ) {
        throw Exception("COULD NOT CONFIGURE OpenAI")
      }
    } catch( error ) {
        console.error('ERROR CONFIGURING API: ', error);
        process.exit(1)
    }
}


async function asyncAsk(question) {
    return new Promise(async (resolve, reject) => {
      try{
        const prompt = `input: ${question} output:`
        console.log('Calling ChatGPT...');
        const completion =   await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 3500,
        top_p: 1,
        stop: ["input:"],

      });
      if(DEBUG)console.log('DEBUG ... successfully called OpenAiAPI.createCompletion')
      answer =  await completion.data.choices[0].text;
      if(DEBUG)onsole.log(`DEBUG the answer: [${answer}]`);
      resolve(answer);
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
          } else {
            console.log(error.message);
          }
        resolve('HORKAGE! ERROR!' + error);
    }
    });
  }

(async () => {  
  configure();
  while (true){ 
    let userQ = await getQuestion();
    let answer = await asyncAsk(userQ);
    console.log('ChatGPT says the answer is:');
    console.log(answer);
  }
})();
