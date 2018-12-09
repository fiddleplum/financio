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

