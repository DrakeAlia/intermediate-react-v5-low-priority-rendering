import { useContext, useState, useDeferredValue, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Results from "./Results";
import AdoptedPetContext from "./AdoptedPetContext";
import useBreedList from "./useBreedList";
import fetchSearch from "./fetchSearch";
const ANIMALS = ["bird", "cat", "dog", "rabbit", "reptile"];

// Right now the biggest re-render in app is when our app gets a new batch of pets to render. Imagine if 
// we had three hundred pets to render: that actually could take a while. And if in the mean time a user clicked a 
// button to adopt a pet or re-search for something else, we'd want to drop rendering other pets and focus 
// on what the user asked for. 

const SearchParams = () => {
  const [requestParams, setRequestParams] = useState({
    location: "",
    animal: "",
    breed: "",
  });
  const [adoptedPet] = useContext(AdoptedPetContext);
  const [animal, setAnimal] = useState("");
  const [breeds] = useBreedList(animal);

  const results = useQuery(["search", requestParams], fetchSearch);
  const pets = results?.data?.pets ?? [];
  // if we get new pets from the API ^^, it's ok to interrupt re-rendering results
  // useDeferredValue takes in a value and gives you a cached version of it: that cached version may be current or it may 
  // be a stale one as it works through a re-render. Evenutally it will be the current one
  const deferredPets = useDeferredValue(pets)
  // useMemo - only update this, if this value here changes [deferredPets]
  const renderedPets = useMemo(
    () => <Results pets={deferredPets} />,
    [deferredPets]
  )

  return (
    <div className="search-params">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const obj = {
            animal: formData.get("animal") ?? "",
            breed: formData.get("breed") ?? "",
            location: formData.get("location") ?? "",
          };
          setRequestParams(obj);
        }}
      >
        {adoptedPet ? (
          <div className="pet image-container">
            <img src={adoptedPet.images[0]} alt={adoptedPet.name} />
          </div>
        ) : null}
        <label htmlFor="location">
          Location
          <input id="location" name="location" placeholder="Location" />
        </label>

        <label htmlFor="animal">
          Animal
          <select
            id="animal"
            name="animal"
            onChange={(e) => {
              setAnimal(e.target.value);
            }}
            onBlur={(e) => {
              setAnimal(e.target.value);
            }}
          >
            <option />
            {ANIMALS.map((animal) => (
              <option key={animal} value={animal}>
                {animal}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="breed">
          Breed
          <select disabled={!breeds.length} id="breed" name="breed">
            <option />
            {breeds.map((breed) => (
              <option key={breed} value={breed}>
                {breed}
              </option>
            ))}
          </select>
        </label>

        <button>Submit</button>
      </form>
      {renderedPets}
    </div>
  );
};

// The idea here is you have some part of your app that when it re-renders it causes 
// jank in other parts of your app and it can be slowed down a bit without issue. useDeferredValue is exactly for that.

export default SearchParams;
