# Notes

* Accounts
* Categories
* Rules

There should be three sections for each account: actual, projections, budget
* actual is the actual transacations (including splits and whatnot)
* projections is trend lines projecting into the future
  * every transaction can have a "one time" that indicates that it is not to be used in projections (or it can be made more complicated than that, like setting intervals and whatnot, per received person)
* budget is the budget

# File Structure

```
data/ - where all of the user data is stored
	accounts/ - where all of the accounts are stored
		checking_transations/ - where all checking account transactions are held
			YYYYMM.json
			YYYYMM.json
			...
		savings_transactions/
		checking.json
		savings.json
```

# File Formats

## Transaction Files

```
[
	{
		'date': string - date of transaction formatted as 'yyyy-mm-dd hh:mm:ss.sss',
		'amount': number - currency amount of transaction
		'description': string - description/memo from bank
		'id': string - transaction id from the bank
		'category': string - the category to which the transaction belongs
		'notes': string - any extra notes
	}
]
```

