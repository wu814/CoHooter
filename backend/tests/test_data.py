"""5 Dummy AI Generator inputs for testing interoperability."""

AI_GENERATOR_TEST_CASES = [
    # Test 1: Simple Addition
    {
        "problem": "Add Two Numbers",
        "starter_code": "def solution(a, b):\n    # Return the sum of a and b\n    pass",
        "correct_solution": "def solution(a, b):\n    return a + b",
        "test_cases": [
            {"input": "solution(10, 5)", "expected": "15"},
            {"input": "solution(0, 0)", "expected": "0"},
            {"input": "solution(-3, 3)", "expected": "0"},
        ],
    },
    # Test 2: Reverse String
    {
        "problem": "Reverse a String",
        "starter_code": "def solution(s):\n    # Return the reversed string\n    pass",
        "correct_solution": "def solution(s):\n    return s[::-1]",
        "test_cases": [
            {"input": "solution('hello')", "expected": "olleh"},
            {"input": "solution('Python')", "expected": "nohtyP"},
            {"input": "solution('')", "expected": ""},
        ],
    },
    # Test 3: Find Maximum in List
    {
        "problem": "Find Maximum",
        "starter_code": "def solution(nums):\n    # Return the maximum number\n    pass",
        "correct_solution": "def solution(nums):\n    return max(nums)",
        "test_cases": [
            {"input": "solution([1, 5, 3, 9, 2])", "expected": "9"},
            {"input": "solution([-1, -5, -3])", "expected": "-1"},
            {"input": "solution([42])", "expected": "42"},
        ],
    },
    # Test 4: FizzBuzz Single Number
    {
        "problem": "FizzBuzz Single",
        "starter_code": "def solution(n):\n    # Return 'Fizz', 'Buzz', 'FizzBuzz', or str(n)\n    pass",
        "correct_solution": """def solution(n):
    if n % 15 == 0: return 'FizzBuzz'
    if n % 3 == 0: return 'Fizz'
    if n % 5 == 0: return 'Buzz'
    return str(n)""",
        "test_cases": [
            {"input": "solution(15)", "expected": "FizzBuzz"},
            {"input": "solution(9)", "expected": "Fizz"},
            {"input": "solution(10)", "expected": "Buzz"},
            {"input": "solution(7)", "expected": "7"},
        ],
    },
    # Test 5: Count Vowels (Edge Case Handling)
    {
        "problem": "Count Vowels",
        "starter_code": "def solution(s):\n    # Return count of vowels (a,e,i,o,u)\n    pass",
        "correct_solution": "def solution(s):\n    return sum(1 for c in s.lower() if c in 'aeiou')",
        "test_cases": [
            {"input": "solution('hello')", "expected": "2"},
            {"input": "solution('AEIOU')", "expected": "5"},
            {"input": "solution('')", "expected": "0"},
            {"input": "solution('xyz')", "expected": "0"},
        ],
    },
]
