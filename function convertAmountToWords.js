function convertAmountToWords(amount) {
    // Split the amount into integer and decimal parts
    var parts = amount.toString().split('.');
    var integerPart = parts[0];
    var decimalPart = parts.length > 1 ? parts[1] : '';

    // Convert the integer part to words
    var integerPartInWords = convertIntegerToWords(integerPart);

    // Convert the decimal part to words
    var decimalPartInWords = convertDecimalToWords(decimalPart);

    // Combine the words for the integer and decimal parts
    var result = integerPartInWords;
    if (decimalPartInWords) {
        result += ' koma ' + decimalPartInWords;
    }
    return result;
}

function convertIntegerToWords(integer) {
    // Handle numbers up to 999,999,999
    if (integer.length > 9) {
        throw new Error('Number too large');
    }

    // Define an array of words for the digits
    var digits = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];

    // Define an array of words for the tens and ones place
    var tensAndOnes = ['', 'sepuluh', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];

    // Define an array of words for the numbers 11 to 19
    var elevenToNineteen = ['sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];

    // Define an array of words for the place values
    var placeValues = ['', 'ribu', 'juta', 'miliar'];

    // Convert the integer to an array of digits
    var digitsArray = integer.split('').reverse().map(function (digit) {
        return parseInt(digit);
    });

    // Initialize the result
    var result = '';

    // Loop through the digits and build the result
    for (var i = 0; i < digitsArray.length; i++) {
        var digit = digitsArray[i];
        var placeValue = placeValues[Math.floor(i / 3)];

        // If the digit is non-zero, add the corresponding word to the result
        if (digit > 0) {
            if (i % 3 === 0) {
                // Hundreds place
                result = digits[digit] + ' ratus ' + result;
            } else if (i % 3 === 1) {
                // Tens place
                if (digit === 1) {
                    // Special case for numbers 11 to 19
                    result = elevenToNineteen[digitsArray[i + 1]] + ' ' + result;
                    i++;
                } else {
                    result = tensAndOnes[digit] + ' ' + result;
                }
            } else {
                // Ones place
                result = digits[digit] + ' ' + result;
            }

            // Add the place value if it's not empty
            if (placeValue) {
                result = placeValue + ' ' + result;
            }
        }
    }
}

function convertDecimalToWords(decimal) {
    // Define an array of words for the digits
    var digits = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];

    // Convert the decimal to an array of digits
    var digitsArray = decimal.split('').map(function (digit) {
        return parseInt(digit);
    });

    // Initialize the result
    var result = '';

    // Loop through the digits and build the result
    for (var i = 0; i < digitsArray.length; i++) {
        var digit = digitsArray[i];
        result += digits[digit] + ' ';
    }
    return result;
}

function pageInit(context) {
    var amount = 120201;
    var amountInWords = convertAmountToWords(amount);
    console.log(amountInWords); // seratus dua puluh tiga ribu empat ratus lima puluh enam koma tujuh delapan
}