
/* The function should return the names of those entries whose date is the current date. The names should be separated by a comma.

For example, here's an array of three entries and assume the date now is 2021-01-21.

[{ name: "Johny" , date: "2021-01-21T02:53:42+05:30" }, { name: "Sugar" , date: "2021-01-22T02:53:42+05:30" }, { name: "Sun" , date: "2021-01-21T03:53:42+05:30" }]

The function should return: ``` Johny,Sun ```. Please note that the names are separated by a comma without space.
*/


function todaysEntries(entries) {
	// current date in IST
	let currDate = new Date().toDateString();

	// function to parse date from enties
	let parsed = (cDate) => new Date(cDate).toDateString();

	// filter
	let entryParsed = entries.filter(x => parsed(x.date) === currDate);
	// join
	let ret = entryParsed.map(x => x.name).join(",")

	return(ret);

}

module.exports = todaysEntries;
