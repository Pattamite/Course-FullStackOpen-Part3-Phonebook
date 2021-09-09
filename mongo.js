const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>');
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv.length >= 4 ? process.argv[3] : null;
const number = process.argv.length >= 5 ? process.argv[4] : null;

const url = `mongodb+srv://pattamite:${password}@fullstackopen-part3.pbxf8.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

if(name && number){
  const person = new Person({
    name: name,
    number: number,
  });
  
  person.save().then(result => {
    console.log('Person saved!')
    mongoose.connection.close()
  });
} else {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  });
}



