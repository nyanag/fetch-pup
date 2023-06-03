import React, { useState, useEffect, useRef } from 'react';
import { Card, Select, Pagination, Button, Col, Row, Divider } from 'antd';
import { Dog, Location } from './types';
import './styles.css';

interface SearchPageProps {
  apiUrl: string;
}

interface SearchResponse {
  resultIds: string[];
  total: number;
  next: string | null;
  prev: string | null;
}

const SearchPage: React.FC<SearchPageProps> = ({ apiUrl }) => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [dogIds, setDogIds] = useState<string[]>([]);
  const [selectedDogs, setSelectedDogs] = useState<Dog[]>([]);
  const [filterBreed, setFilterBreed] = useState<string | undefined>("Chihuahua");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'|''>('');
  const [isSortSet, setIsSort] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dogsPerPage] = useState<number>(10);
  const [breedOptions, setBreedOptions] = useState<string[]>([]);
  const [match, setMatch] = useState<Dog[]>([]);
  const filterBreedRef = useRef<string | undefined>(filterBreed);

  //update filterBreed - Pagination fixes
  useEffect(() => {
    filterBreedRef.current = filterBreed;
  }, [filterBreed]);

  const fetchDogs = async () => {
    try {
      const response = await fetch(apiUrl + 'dogs', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(dogIds),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data: Dog[] = await response.json();
        console.log("DOGS DETAILS [fetchDogs]", data);
        setDogs(data);
      } else {
        throw new Error('Failed to fetch dogs');
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  // Fetch breed options from the API
  const fetchBreeds = async () => {
    try {
      const response = await fetch(apiUrl + 'dogs/breeds', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBreedOptions(data);
      } else {
        throw new Error('Failed to fetch breed options');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch location/ city options from the API
  const fetchLocations = async () => {
    try {
      const response = await fetch(apiUrl + 'locations/search', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCities(data.results);
      } else {
        throw new Error('Failed to fetch breed options');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDogsByCity = async (city: string) => {
    const queryParams = new URLSearchParams({
      zipCodes: JSON.stringify([city]),
    });

    try {
      const response = await fetch(apiUrl + `dogs/search?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[fetchDogsByCity]', data)
        setDogs(data.resultIds);
      } else {
        throw new Error('Failed to fetch dogs');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch dog details from the API
  const fetchDogDetails = async () => {
    try {
      const response = await fetch(apiUrl + 'dogs/search', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("[fetchDogDetails]", data);
        setDogIds(data.resultIds);
      } else {
        throw new Error('Failed to fetch dog details');
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  // Fetch dogs data based on search criteria
  const fetchFilteredDogs = async () => {
    console.log(filterBreed, sortOrder, isSortSet)
    try {
      const queryParams = new URLSearchParams({
        breed: filterBreedRef.current ? JSON.stringify([filterBreedRef.current]) : '',
        size: dogsPerPage.toString(),
        sort: isSortSet? `breed:${sortOrder}` : '',
        from: ((currentPage - 1) * dogsPerPage).toString(),
      });
  
      const response = await fetch(apiUrl + `dogs/search?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data: SearchResponse = await response.json();
        console.log("[fetchFilteredDogs]",data);
        setDogIds(data.resultIds);
      } else {
        throw new Error('Failed to fetch filtered dogs');
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    console.log('[Fetching breeds and dog details]')
    fetchBreeds();
    fetchLocations();
    fetchDogDetails();
  }, []);
  
  useEffect(() => {
    console.log('[Fetching dog details]')
    if (dogIds.length > 0) {
      fetchDogs();
    }
  }, [dogIds]);

  useEffect(() => {
    if (selectedCity) {
      fetchDogsByCity(selectedCity);
    }
  }, [selectedCity]);
  
  useEffect(() => {
    fetchFilteredDogs();
  }, [filterBreed, currentPage]);
  

  // Handle match generation
  const handleGenerateMatch = async () => {
    console.log(selectedDogs)
    const selectedDogIds = selectedDogs.map(dog => dog.id);
    try {
      const response = await fetch(apiUrl + 'dogs/match', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(selectedDogIds),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Handle the generated match data
        console.log('Generated match:', data);
        const response1 = await fetch(apiUrl + 'dogs', {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify([data.match]),
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response1.ok) {
          const data: Dog[] = await response1.json();
          console.log("Match",data)
          setMatch(data);
        } else {
          throw new Error('Failed to fetch dogs');
        }
      } else {
        throw new Error('Failed to generate match');
      }
    } catch (error) {
      console.error(error);
    }
  };

    
  // Handle breed filter change
  const handleFilterBreedChange = (value: string) => {
    setFilterBreed(value);
    setCurrentPage(1); // Reset to the first page when changing the filter
  };

  // Handle breed filter change
  const handleFilterLocationChange = (value: string) => {
    console.log(value)
    setSelectedCity(value)
    setCurrentPage(1); // Reset to the first page when changing the filter
  };

  // Handle sort order change
  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    setSortOrder(value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle favorite dog selection
  const handleDogSelect = (dog: Dog) => {
    setSelectedDogs((prevSelectedDogs) => {
      if (prevSelectedDogs.some((selectedDog) => selectedDog.id === dog.id)) {
        // Dog already exists in the list, do nothing
        return prevSelectedDogs;
      } else {
        // Add the dog to the list
        return [...prevSelectedDogs, dog];
      }
    });
  };

  //Handle removing dog from favorites
  const handleDogRemove = (dog: Dog) => {
    setSelectedDogs((prevSelectedDogs) => {
      const updatedSelectedDogs = prevSelectedDogs.filter((selectedDog) => selectedDog.id !== dog.id);
      return updatedSelectedDogs;
    });
  };

  //TESTING filter only for sorting
  const handleFilter = () => {
    setIsSort(true);
    fetchFilteredDogs();
  }

  return (
    <div className='search-container'>
      <div className='dropdown-container'>
      <h3>Filter by breed</h3>
        <Select
        showSearch
          style={{ width: 200 }}
          placeholder="Filter by breed"
          allowClear
          onChange={handleFilterBreedChange}
        >
          {breedOptions.map((breed) => (
            <Select.Option key={breed} value={breed}>
              {breed}
            </Select.Option>
          ))}
        </Select>
        <h3>Filter by locations</h3>
        <Select
         showSearch
          style={{ width: 200 }}
          placeholder="Filter by locations"
          allowClear
          onChange={handleFilterLocationChange}
        >
          {cities.map((location) => (
            <Select.Option key={location.zip_code} value={location.zip_code}>
              {location.city}
            </Select.Option>
          ))}
        </Select>
        <h3>Sort order</h3>
        <Select style={{ width: 120 }} onChange={handleSortOrderChange}>
          <Select.Option value="asc">Ascending</Select.Option>
          <Select.Option value="desc">Descending</Select.Option>
        </Select>
        <Button type="primary" onClick={handleFilter}>
          Apply Sort 
        </Button>

      </div>
      <div style={{ marginTop: 16 }}>
      <Row gutter={[16,24]}>
        {dogs.length > 0 ? (
          dogs.map((dog) => (
            <Col className="gutter-row" span={6} key={dog.id}>
              <Card
                style={{ width: 300, marginBottom: 16 }}
                cover={<img alt={dog.breed} src={dog.img} />}
                actions={[
                  <Button onClick={() => handleDogSelect(dog)} key={dog.id}>
                    Add to Favorites
                  </Button>,
                ]}
              >
                <Card.Meta title={dog.breed} description={`Age: ${dog.age}`} />
                <p>Name: {dog.name}</p>
                <p>Zip Code: {dog.zip_code}</p>
              </Card>
            </Col>
          ))
        ) : (
          <div>Set the filters to view dogs!</div>
        )}
      </Row>
      </div>
      <Pagination
        style={{ marginTop: 16, textAlign: 'center' }}
        current={currentPage}
        pageSize={dogsPerPage}
        total={dogs.length}
        onChange={handlePageChange}
      />
      <div style={{ marginTop: 16, marginBottom:24 }}>
        <h2>Selected Dogs:</h2>
      <Row gutter={[16,24]}>
        {selectedDogs.map((dog) => (
          <Col className="gutter-row" span={8}>
          <Card
            key={dog.id}
            style={{ width: 300, marginBottom: 16 }}
            cover={<img alt={dog.breed} src={dog.img} />}
            actions={[
              <Button onClick={() => handleDogRemove(dog)} key={dog.id}>
                Remove from Favorites
              </Button>,
            ]}
          >
            <Card.Meta title={dog.breed} description={`Age: ${dog.age}`} />
            <p>Name: {dog.name}</p>
            <p>Zip Code: {dog.zip_code}</p>
          </Card>
        </Col>
        ))}
      </Row>

      </div>

      <Button type="primary" onClick={handleGenerateMatch} disabled={selectedDogs.length === 0}>
          Generate Match
        </Button>

        
        {match?.map((dog) => (
          <> 
          <Divider orientation="left">You've found your match!</Divider>
          <Card
            key={dog.id}
            style={{ width: 300, marginBottom: 16 }}
            cover={<img alt={dog.breed} src={dog.img} />}
          >
            <Card.Meta title={dog.breed} description={`Age: ${dog.age}`} />
            <p>Name: {dog.name}</p>
            <p>Zip Code: {dog.zip_code}</p>
          </Card>
          </>
        ))}
    </div>
  );
};

export default SearchPage;
