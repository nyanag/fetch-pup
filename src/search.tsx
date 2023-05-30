import React, { useState, useEffect } from 'react';
import { Card, Select, Pagination, Button } from 'antd';
import { Dog } from './types'; // Assuming you have the Dog and Location types defined

interface SearchPageProps {
  matchEndpoint?: string; // Endpoint for generating the match
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
  const [dogIds, setDogIds] = useState([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [selectedDogs, setSelectedDogs] = useState<Dog[]>([]);
  const [filterBreed, setFilterBreed] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dogsPerPage] = useState<number>(10);

  const [breedOptions, setBreedOptions] = useState<string[]>([]);

  const fetchDogs = async () => {
    console.log('DOG IDS', dogIds)
    try {
      const response = await fetch(apiUrl + 'dogs', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(dogIds),
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const data: Dog[] = await response.json();
        console.log(data)
        setDogs(data);
      } else {
        throw new Error('Failed to fetch dogs');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch breed options from the API
  useEffect(() => {
    // Fetch the breed options using the /dogs/breeds endpoint
    const fetchBreeds = async () => {
      try {
        const response = await fetch(apiUrl + 'dogs/breeds', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },});
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

    fetchBreeds();
  }, []);

  // Fetch dog details from the API
  useEffect(() => {
    // Fetch the dog details using the /dogs/search endpoint
    const fetchBreeds = async () => {
      try {
        const response = await fetch(apiUrl + 'dogs/search', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },});
        if (response.ok) {
          const data = await response.json();
          console.log("DETAILS", data);
          setDogIds(data.resultIds);
          fetchDogs();
        } else {
          throw new Error('Failed to fetch breed options');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchBreeds();
  }, [currentPage]);

  // Fetch dogs data based on search criteria
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const queryParams = new URLSearchParams({
          breeds: filterBreed ? JSON.stringify([filterBreed]) : '',
          size: dogsPerPage.toString(),
          sort: `breed:${sortOrder}`,
          from: ((currentPage - 1) * dogsPerPage).toString(),
        });
        console.log(queryParams)
        const response = await fetch(apiUrl + `dogs/search?${queryParams}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },});
        if (response.ok) {
          const data: SearchResponse = await response.json();
          console.log(data, dogs)
          if(data.resultIds){
            //setFilteredDogs(data.resultIds.map((id) => dogs.find((dog) => dog.id === id)).filter(Boolean));
          }
        } else {
          throw new Error('Failed to fetch dogs');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDogs();
  }, [filterBreed, sortOrder, currentPage]);

  // Handle breed filter change
  const handleFilterBreedChange = (value: string) => {
    setFilterBreed(value);
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
    setSelectedDogs((prevSelectedDogs) => [...prevSelectedDogs, dog]);
  };


  return (
    <div>
      <div>
        <Select
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
        <Select style={{ width: 120 }} defaultValue="asc" onChange={handleSortOrderChange}>
          <Select.Option value="asc">Ascending</Select.Option>
          <Select.Option value="desc">Descending</Select.Option>
        </Select>
      </div>
      <div style={{ marginTop: 16 }}>
        {dogs.map((dog) => (
          <Card
            key={dog.id}
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
        ))}
      </div>
      <Pagination
        style={{ marginTop: 16, textAlign: 'center' }}
        current={currentPage}
        pageSize={dogsPerPage}
        total={filteredDogs.length}
        onChange={handlePageChange}
      />
      <div style={{ marginTop: 16 }}>
        <h2>Selected Dogs:</h2>
        {selectedDogs.map((dog) => (
          <div key={dog.id}>{dog.name}</div>
        ))}

      </div>
    </div>
  );
};

export default SearchPage;
