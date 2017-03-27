/*
TODO:

#1
	each chaining return a partial application. 
	issue with current design:
		var i = streamy(arr);
		i.fill(9)
		i.fill(5)  // same as streamy(arr).fill(9).fill(5)
		i.fill(9)()
		i.fill(5)	// breaks loop linearity
	This is unintuitive. By returning partial application the behaviour changes to 
		i.fill(9)  // => streamy(arr).fill(9)
		var j = i.fill(5)  // => streamy(arr).fill(5)
		j.fill(9)() // => streamy(arr).fill(5).fill(9)()
		i.fill(4)  // => streamy(arr).fill(4) loop linearity is not broken.

#2
every predicate will get an apply(index) method as parameter just before exit()
apply(index) will apply operations at each stage to `array[index]` all the way to stage just before current.
these values will be cached so it doesn't need to be re-executed
if the process loop has passed `array[index]` , then cached value will be returned;
NB: THIS IS NOT A REPLACEMENT FOR THE `index` AND `array` PARAMETERS PASSED WITH PREDICATE.
*/

function streamy(array){
	var context = {
		array: array,
		sequence: [],
		exec: function () {
			var array = context.array;
			var arrayLen = array.length;
			var sequence = context.sequence;
			var seqLen = sequence.length;
			var result = [];
			var resultPointer = 0;
			var accumulate ;
			var singleValue = false;
			var pass, skip, key, predicate, modifier, args;
			var stopIteration = false;
			var frugal = true; // frugal flag will break execution when exit() is called

			function exit(){
				stopIteration = frugal && true;
			}
			for( var i=0; i<arrayLen; ++i, ++resultPointer) {
				pass = array[i]
				skip = false;
				for( var j=0; j<seqLen; ++j) {

					// if(chainBreak) throw new TypeError('Non-iterable stages are not chainable');
					key = sequence[j][0]
					predicate = sequence[j][1]
					modifier = sequence[j][2]
					args = sequence[j][3]

					switch(key){

						// case "fill":{
						// 	var st = args[2] || 0, end = args[3] || arrayLen;
						// 	if(st <= resultPointer && resultPointer < end)
						// 		pass = sequence[j][1]
						// 	break;
						// }
						case "filter":{
							if(!predicate.call(modifier,pass,i,array,exit)){
								j = seqLen; // break after this iteration
								skip = true;
								resultPointer--;
							}
							break;
						}
						case "forEach":{
							frugal = false;	// frugal causes to stop iteration on exit(). this will affect foreach
							predicate.call(modifier,pass,i,array,exit)
							break;
						}
						case "map":{
							pass = predicate.call(modifier,pass,i,array,exit)
							break;
						}

						case "reduce":{
							j = seqLen; // break after this iteration
							skip = true;
							singleValue = true;
							if( i === 0){
								if(args.length < 3){
									accumulate = pass;
									break;
								}
								accumulate = modifier;
							}
							
							accumulate = predicate(accumulate,pass,i,array,exit)
							break;
						}
					}
				}
				if(!skip) result.push(pass);
				if(stopIteration) break;
			}

			if(singleValue) return accumulate;
			return result;
		}
	}
	
	context.appendOperation = appendOperation.bind(context);
//primary ops
	Object.defineProperty(context.exec,"filter" , {value: appendOperation.bind(context,"filter") })
	Object.defineProperty(context.exec,"forEach" , {value: appendOperation.bind(context,"forEach") }) //pass through
	Object.defineProperty(context.exec,"map" , {value: appendOperation.bind(context,"map") })
	Object.defineProperty(context.exec,"reduce" , {value: context.appendOperation.bind(context,"reduce") })

//non chainable
	
	Object.defineProperty(context.exec,"every" , {value: everyReduce.bind(context) })
	Object.defineProperty(context.exec,"find" , {value: findReduce.bind(context) })
	Object.defineProperty(context.exec,"findIndex" , {value: findIndexReduce.bind(context) })
	Object.defineProperty(context.exec,"join" , {value: joinReduce.bind(context) })
	 Object.defineProperty(context.exec,"some" , {value: someReduce.bind(context) })
	
// chainable
	
	Object.defineProperty(context.exec,"fill" , {value: fillMap.bind(context) })
	Object.defineProperty(context.exec,"slice" , {value: sliceFilter.bind(context) })
	
	// keys() | values()
	return context.exec;

}

module.exports = streamy;


function appendOperation (key,predicate,modifier) {
	if(key === "reduce" && arguments.length < 3 && this.array.length == 0) {
		throw new TypeError('Reduce of empty array with no initial value');
	}
	this.sequence.push([key,predicate,modifier,arguments])
	return this.exec;
}
/*
*		Pseudo Map operations
*/
function fillMap (value, start, end) {
	start = start || 0
	end = end || this.array.length
	return this.appendOperation( "map", ( element, index ) => (start <= index && index < end) ? value : element )
}

/*
*		Pseudo Filter operations
*/
function sliceFilter (begin,end) {
	begin = begin || 0
	end = end || this.array.length
	return this.appendOperation( "filter", ( element, index, array, exit ) => {
		if(index === end) exit();
		return (begin <= index && index < end)
	} )
}

/*
*		Pseudo Reduce operations
*/
function everyReduce (predicate) {
	
	return this.appendOperation( "reduce", ( accumulator, currentValue, currentIndex, array ) => {
		return accumulator && predicate(currentValue, currentIndex, array)
	}, true )
}
function findReduce (predicate) {
	
	return this.appendOperation( "reduce", ( accumulator, currentValue, currentIndex, array, exit ) => {
		if(accumulator !== undefined) return accumulator;
		if(predicate(currentValue, currentIndex, array)){
			exit();
			return currentValue
		}
	}, undefined )
}
function findIndexReduce (predicate) {
	
	return this.appendOperation( "reduce", ( accumulator, currentValue, currentIndex, array, exit ) => {
		if(accumulator > -1) return accumulator;
		if(predicate(currentValue, currentIndex, array)){
			exit();
			return currentIndex
		}
		return -1;
	}, -1 )
}

function joinReduce (separator) {
	separator = separator === undefined ? "," : String(separator)
	return this.appendOperation( "reduce", ( accumulator, currentValue, currentIndex, array ) => accumulator+separator+currentValue)
}

function someReduce (predicate) {
	
	return this.appendOperation( "reduce", ( accumulator, currentValue, currentIndex, array, exit ) => {
		if(predicate(currentValue, currentIndex, array)){
			exit();
			return true;
		}
		return accumulator || false;
	}, false )
}