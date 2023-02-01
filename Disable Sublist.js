/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord'],
	/**
	 * @param {record} record
	 */
	function (currentRecord) {
		/**
		 * Function to be executed after line is selected.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 *
		 * @since 2015.2
		 */
		function disableLineField(scriptContext) {
			try {
				var currentRecord = scriptContext.currentRecord;
				var sublistId = scriptContext.sublistId;

				if (sublistId !== 'item') return;

				var selectedLine = currentRecord.getCurrentSublistIndex({
					sublistId: 'item'
				});

				log.debug({
					title: 'selectedLine',
					details: JSON.stringify(selectedLine)
				});

				var rate = currentRecord.getSublistField({
					sublistId: 'item',
					fieldId: 'rate',
					line: selectedLine
				});

				log.debug({
					tittle: 'rate',
					details: rate
				});

				var price = currentRecord.getSublistField({
					sublistId: 'item',
					fieldId: 'price',
					line: selectedLine
				});

				log.debug({
					tittle: 'price',
					details: price
				});

				var amount = currentRecord.getSublistField({
					sublistId: 'item',
					fieldId: 'amount',
					line: selectedLine
				});

				log.debug({
					tittle: 'amount',
					details: amount
				});

				rate.isDisabled = true;
				price.isDisabled = true;
				amount.isDisabled = true;

			} catch (error) {
				log.debug({
					title: 'Catch Error',
					details: error
				});
			}
		}

		return {
			lineInit: disableLineField,
			postSourcing: disableLineField
		};
	});