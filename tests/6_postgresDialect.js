'use strict';

var jsonSql = require('../lib')({
	dialect: 'postgresql',
	namedValues: false
}),
	expect = require('expect.js');

describe('Postgresql specific dialect test', function() {
	describe('json', function() {
		it('should correctly wrap each part of json path', function() {
			var result = jsonSql.build({
				table: 'test',
				fields: ['params->a->>b'],
				condition: {
					'params->>c': {$like: '7%'}
				}
			});

			expect(result.query).to.be(
				'select "params"->\'a\'->>\'b\' from "test" ' +
				'where "params"->>\'c\' like $1;'
			);
		});

		it('should be ok with $jsonContains conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					'params->a': {
						$jsonContains: {b: 1}
					}
				}
			});

			expect(result.query).to.be(
				'select * from "test" where "params"->\'a\' @> $1;'
			);
			expect(result.values).to.eql(['{"b":1}']);
		});

		it('should be ok with $jsonIn conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					'params->a': {
						$jsonIn: {$field: 'data->b'}
					}
				}
			});

			expect(result.query).to.be(
				'select * from "test" where "params"->\'a\' <@ "data"->\'b\';'
			);
			expect(result.values).to.eql([]);
		});

		it('should be ok with $jsonHas conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {$jsonHas: 'account'}
				}
			});

			expect(result.query).to.be('select * from "test" where "params" ? $1;');
			expect(result.values).to.eql(['account']);
		});

		it('should be ok with $jsonHasAny conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {$jsonHasAny: ['a', 'b']}
				}
			});

			expect(result.query).to.be(
				'select * from "test" where "params" ?| array[$1, $2];'
			);
			expect(result.values).to.eql(['a', 'b']);
		});

		it('should be ok with $jsonHasAll conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {$jsonHasAll: ['a', 'b']}
				}
			});

			expect(result.query).to.be(
				'select * from "test" where "params" ?& array[$1, $2];'
			);
			expect(result.values).to.eql(['a', 'b']);
		});
	});
});