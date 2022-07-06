const { average } = require('../utils/for_testing')

describe('average', () => {
    test('of one value is the value itself', () => {
        expect(average([1])).toBe(1)
    })


    test('average of 10', () => {
        const result = average([10])

        expect(result).toBe(10)    
    })

    test('average of [10,0,10,0]', () => {
        const result = average([10,0,10,0])

        expect(result).toBe(5)
    })

    test('average of [8, 3, 2, 1, 6, 21, 54]', () => {
        const result = average([8,3,2,1,6,21,54])

        expect(result).toBe(13.571428571428571)
    })

})